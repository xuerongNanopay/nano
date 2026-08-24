import { Type, type Context, type Tool } from '@pi-ai';
import { builtinModels } from '@pi-ai/providers/all';
import { InMemoryCredentialStore } from '@pi-ai';
import "dotenv/config";

async function main() {

    const credentials = new InMemoryCredentialStore();
    await credentials.modify("openai", async () => ({
    type: "api_key",
    key: process.env.OPENAI_API_KEY,
    }));
    const models = builtinModels({ credentials });

    // const openaiModels = models.getModels('openai');
    // for (const m of openaiModels) {
    //     console.log(`${m.id}: ${m.name}`);
    //     console.log(`   API: ${m.api}`);
    //     console.log(`   Context: ${m.contextWindow} tokens`);
    //     console.log(`   Vision: ${m.input.includes('image')}`);
    //     console.log(`   Reasoning: ${m.reasoning}`);
    // }

    const model = models.getModel('openai', 'gpt-4o-mini')!;
    console.log(`${model.id}`);
    console.log(`   API: ${model.api}`);
    console.log(`   Context: ${model.contextWindow} tokens`);
    console.log(`   Vision: ${model.input.includes('image')}`);
    console.log(`   Reasoning: ${model.reasoning}`);

    const tools: Tool[] = [{
        name: 'get_time',
        description: 'Get the current time',
        parameters: Type.Object({
            timezone: Type.Optional(Type.String({ description: 'Optional timezone (e.g., America/New_York'}))
        })
    }];

    const context: Context = {
        systemPrompt: 'You are a help assistant.',
        messages: [{ role: 'user', content: 'What time is it?', timestamp: Date.now() }],
        tools
    };

    const s = models.stream(model, context);

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
        const continuation = await models.complete(model, context);
        context.messages.push(continuation);
        console.log('After tool execution: ', continuation.content);
    }

    console.log(`Total tokens: ${finalMessage.usage.input} in, ${finalMessage.usage.output} out`);
    console.log(`Cost: $${finalMessage.usage.cost.total.toFixed(4)}`);

    const response = await models.complete(model, context);

    for (const block of response.content) {
        if (block.type === 'text') {
            console.log(block.text);
        } else if (block.type === 'toolCall') {
            console.log(`Tool: ${block.name}(${JSON.stringify(block.arguments)})`);
        }
    }
}

main();