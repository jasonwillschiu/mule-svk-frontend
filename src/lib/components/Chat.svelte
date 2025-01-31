<script>
  import { Button } from "$lib/components/ui/button";
  import { Textarea } from "$lib/components/ui/textarea"; // Changed to Textarea
  import * as Avatar from "$lib/components/ui/avatar";
  import { X, Send } from "lucide-svelte";
  import { sendMessage } from "$lib/services/chat";
  import { tick } from "svelte";
  import Markdown from "svelte-exmarkdown";
  import { gfmPlugin } from "svelte-exmarkdown/gfm";

  const plugins = [gfmPlugin()];

  let messages = $state([
    {
      type: "bot",
      text: "Hello! How can I assist you today?",
      timestamp: new Date(),
    },
  ]);

  let messageInput = $state("");
  let isLoading = $state(false);
  let textareaElement;

  // Modified key handler for Cmd/Ctrl + Enter
  function handleKeyPress(event) {
    // Check for Cmd (Mac) or Ctrl (Windows) + Enter
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      handleSubmit();
    }
    // Regular enter creates new line (default textarea behavior)
  }

  async function handleSubmit() {
    if (!messageInput.trim() || isLoading) return;

    const userMessage = messageInput;
    messageInput = "";

    try {
      isLoading = true;

      messages = [
        ...messages,
        {
          type: "user",
          text: userMessage,
          timestamp: new Date(),
        },
      ];

      const response = await sendMessage(userMessage);

      messages = [
        ...messages,
        {
          type: "bot",
          text: response.message,
          timestamp: new Date(),
        },
      ];
    } catch (error) {
      messages = [
        ...messages,
        {
          type: "bot",
          text: "Sorry, I encountered an error. Please try again.",
          timestamp: new Date(),
          isError: true,
        },
      ];
    } finally {
      isLoading = false;
      textareaElement?.focus();
    }
  }

  let viewport;

  $effect.pre(() => {
    messages;
    if (!viewport) return;

    const shouldScroll =
      viewport.offsetHeight + viewport.scrollTop > viewport.scrollHeight - 50;

    if (shouldScroll) {
      tick().then(() => {
        viewport.scrollTo(0, viewport.scrollHeight);
      });
    }
  });
</script>

<div
  class="fixed bottom-4 right-4 w-[400px] h-[600px] rounded-lg shadow-xl overflow-hidden border border-gray-200 dark:border-gray-800"
>
  <div class="flex flex-col h-full bg-white dark:bg-gray-900">
    <header
      class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-blue-600"
    >
      <h2 class="text-lg font-semibold text-white">ChatBot</h2>
    </header>

    <div bind:this={viewport} class="flex-1 overflow-y-auto p-4 space-y-4">
      {#each messages as message}
        <div
          class="flex items-end space-x-2 {message.type === 'user'
            ? 'ml-auto flex-row-reverse'
            : ''}"
        >
          <div class="flex-none w-10 h-10">
            <Avatar.Root>
              <Avatar.Image
                src={message.type === "bot" ? "/bot2.avif" : "/man.avif"}
                alt={message.type === "bot" ? "ChatBot" : "User"}
              />
              <Avatar.Fallback
                >{message.type === "bot" ? "CB" : "U"}</Avatar.Fallback
              >
            </Avatar.Root>
          </div>
          <div class="flex-1 min-w-0 max-w-[80%]">
            <div
              class="rounded-lg {message.type === 'bot'
                ? 'bg-gray-100 dark:bg-gray-800'
                : 'bg-blue-100 dark:bg-blue-800'} p-3"
            >
              <div class="text-sm text-gray-900 dark:text-gray-100">
                <Markdown md={message.text} {plugins} />
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>

    <div class="border-t border-gray-200 dark:border-gray-800 p-4">
      <form
        class="flex space-x-2"
        onsubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <Textarea
          bind:this={textareaElement}
          class="flex-1 min-h-[60px] max-h-[200px]"
          placeholder="Type your message (Cmd/Ctrl + Enter to send)"
          bind:value={messageInput}
          disabled={isLoading}
          on:keydown={handleKeyPress}
          rows={1}
        />
        <Button
          type="submit"
          disabled={isLoading}
          on:click={() => textareaElement?.focus()}
        >
          <Send class="w-6 h-6" />
          <span class="sr-only">Send message</span>
        </Button>
      </form>
    </div>
  </div>
</div>
