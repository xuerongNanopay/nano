import { 
    Type, 
    type Model, 
    type Context, 
    type Tool, 
    type Api, 
    type MutableModels,
    type StringEnum,
    type AssistantMessage
} from '@pi-ai';
import { builtinModels } from '@pi-ai/providers/all';
import { InMemoryCredentialStore } from '@pi-ai';
import "dotenv/config";

const tools: Tool[] = [
    {
        name: 'get_time',
        description: 'Get the current time',
        parameters: Type.Object({
            timezone: Type.Optional(Type.String({ description: 'Optional timezone (e.g., America/New_York'}))
        })
    },
    {
        name: 'whoami',
        description: 'Return current username',
        parameters: Type.Never
    }
];

function printModelMeta(model: Model<Api>) {
    console.log(`${model.id}`);
    console.log(`   API: ${model.api}`);
    console.log(`   Context: ${model.contextWindow} tokens`);
    console.log(`   Vision: ${model.input.includes('image')}`);
    console.log(`   Reasoning: ${model.reasoning}`);
}

async function wrapper(name: string, run: () => Promise<void>) {
    console.log(`>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ${name} >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>`);
    await run();
    console.log(`================================= ${name} =================================`);
}

async function openaiComplete(context: Context, model: string = 'gpt-4o-mini'): Promise<AssistantMessage> {

    const provider = await initProvider();
    const m = provider.getModel('openai', model)!;

    return provider.complete(m, context);
}

async function initProvider(): Promise<MutableModels> {
    // const credentials = new InMemoryCredentialStore();
    // await credentials.modify('openai', async () => ({
    //     type: 'api_key',
    //     key: process.env.OPENAI_API_KEY!
    // }))
    // return builtinModels({ credentials });
    return builtinModels();
}

async function demoWithStream() {

    const provider = await initProvider();
    const model = provider.getModel('openai', 'gpt-4o-mini')!;
    printModelMeta(model);
    
    const context: Context = {
        systemPrompt: 'You are a help assistant.',
        messages: [{ role: 'user', content: 'What time is it?', timestamp: Date.now() }],
        tools
    };

    const s = provider.stream(model, context);

    for await (const event of s) {
    switch (event.type) {
        case 'start':
        console.log(`Starting with ${event.partial.model}`);
        break;
        case 'text_start':
        console.log('\n[Text started]');
        break;
        case 'text_delta':
        process.stdout.write(event.delta);
        break;
        case 'text_end':
        console.log('\n[Text ended]');
        break;
        case 'thinking_start':
        console.log('[Model is thinking...]');
        break;
        case 'thinking_delta':
        process.stdout.write(event.delta);
        break;
        case 'thinking_end':
        console.log('[Thinking complete]');
        break;
        case 'toolcall_start':
        console.log(`\n[Tool call started: index ${event.contentIndex}]`);
        break;
        case 'toolcall_delta':
        // Partial tool arguments are being streamed
        const partialCall = event.partial.content[event.contentIndex];
        if (partialCall.type === 'toolCall') {
            console.log(`[Streaming args for ${partialCall.name}]`);
        }
        break;
        case 'toolcall_end':
        console.log(`\nTool called: ${event.toolCall.name}`);
        console.log(`Arguments: ${JSON.stringify(event.toolCall.arguments)}`);
        break;
        case 'done':
        console.log(`\nFinished: ${event.reason}`);
        break;
        case 'error':
        console.error(`Error: ${event.error.errorMessage}`);
        break;
    }
    }

    const finalMessage = await s.result();
    context.messages.push(finalMessage);

    const toolCalls = finalMessage.content.filter(b => b.type === 'toolCall');
    for (const call of toolCalls) {
        const result = call.name === 'get_time'
            ? new Date().toLocaleString('en-US', {
                timeZone: call.arguments.timezone || 'UTC',

            }) : 'Unknown tool';
        
        context.messages.push({
            role: 'toolResult',
            toolCallId: call.id,
            toolName: call.name,
            content: [{ type: 'text', text: result }],
            isError: false,
            timestamp: Date.now()
        });
    }

    if (toolCalls.length > 0) {
        const continuation = await provider.complete(model, context);
        context.messages.push(continuation);
        console.log('After tool execution: ', continuation.content);
    }

    console.log(`Total tokens: ${finalMessage.usage.input} in, ${finalMessage.usage.output} out`);
    console.log(`Cost: $${finalMessage.usage.cost.total.toFixed(4)}`);

    const response = await provider.complete(model, context);

    for (const block of response.content) {
        if (block.type === 'text') {
            console.log(block.text);
        } else if (block.type === 'toolCall') {
            console.log(`Tool: ${block.name}(${JSON.stringify(block.arguments)})`);
        }
    }
}

async function demoWithComplete() {
    const provider = await initProvider();
    const model = provider.getModel('openai', 'gpt-4o-mini')!;
    printModelMeta(model);
    

    const context: Context = {
        systemPrompt: "You are concise and practical.",
        messages: [
            {
            role: "user",
            content: "WHat is my name?",
            timestamp: Date.now(),
            },
        ],
        tools
    };

    const assistant = await provider.complete(model, context);

    console.log(assistant);
}

async function demoWithAuth() {
    const provider = await initProvider();
    const model = provider.getModel('openai', 'gpt-4o-mini')!;

    const providerAuth = await provider.getAuth(model.provider);
    const modelAuth = await provider.getAuth(model);

    console.log(providerAuth);
    console.log(modelAuth);
}

async function demoWithTool() {
    const weatherTool: Tool = {
        name: 'get_weather',
        description: 'Get current weather for a location',
        parameters: Type.Object({
            location: Type.String({ descpriont: 'City name or coordinates' }),
        }, { additionalProperties: false }),
        constrainedSampling: { type: 'json_schema', strict: 'prefer' }
    }

    const context: Context = {
        messages: [
            {
                role: 'user',
                content: 'What is the weather in London?',
                timestamp: Date.now()
            }
        ],
        tools: [weatherTool]
    };
    
    const assistant = await openaiComplete(context);
    console.log(assistant);
}

async function main() {
    await wrapper("demo with stream", demoWithStream);
    await wrapper("demo with complete", demoWithComplete);
    await wrapper("demo with auth", demoWithAuth);
    await wrapper("demo tool", demoWithTool);
}

main();