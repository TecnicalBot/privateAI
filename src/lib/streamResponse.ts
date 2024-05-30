export function streamResponse(response: AsyncGenerator<any, void, unknown>): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      for await (const part of response) {
        const chunk = encoder.encode(part.response ?? part);
        controller.enqueue(chunk);
        if (part.done) break;
      }
      controller.close();
    }
  });
}
