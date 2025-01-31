<script>
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import * as Avatar from "$lib/components/ui/avatar";
    import { Send } from "lucide-svelte";
    import { sendMessage } from "$lib/services/chat";
    import { tick } from "svelte";
    import Markdown from "svelte-exmarkdown";
    import { gfmPlugin } from "svelte-exmarkdown/gfm";
    import { Skeleton } from "$lib/components/ui/skeleton";
    import HelpCircle from "lucide-svelte/icons/help-circle";
    import * as HoverCard from "$lib/components/ui/hover-card/index.js";

    // Import DatePicker Component
    import DatePicker from "$lib/components/DatePicker.svelte";

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
    let viewport;
    let selectedDateFormatted = $state(null); // State to hold formatted date

    function formatTime(date) {
        return new Intl.DateTimeFormat("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        }).format(date);
    }

    function handleDateChange(event) {
        selectedDateFormatted = event.detail; // Update formatted date from DatePicker event
    }

    async function handleSubmit() {
        if (!messageInput.trim() || isLoading) return;

        const userMessage = messageInput;
        messageInput = "";

        try {
            isLoading = true;

            // Add user message and bot loading message
            messages = [
                ...messages,
                {
                    type: "user",
                    text: userMessage,
                    timestamp: new Date(),
                },
                {
                    type: "bot",
                    text: "", // Empty text for loading state
                    isLoading: true,
                    timestamp: new Date(),
                },
            ];

            // Include filter in sendMessage call
            const response = await sendMessage(
                userMessage,
                selectedDateFormatted,
            );

            // Replace loading message with actual response
            messages = [
                ...messages.slice(0, -1), // Remove loading message
                {
                    type: "bot",
                    text: response.promptResponse,
                    timestamp: new Date(),
                },
            ];
        } catch (error) {
            // Replace loading message with error
            messages = [
                ...messages.slice(0, -1),
                {
                    type: "bot",
                    text: "Sorry, I encountered an error. Please try again.",
                    timestamp: new Date(),
                    isError: true,
                },
            ];
        } finally {
            isLoading = false;
            selectedDateFormatted = null;
        }
    }

    $effect.pre(() => {
        messages;
        if (!viewport) return;

        const shouldScroll =
            viewport.offsetHeight + viewport.scrollTop >
            viewport.scrollHeight - 50;

        if (shouldScroll) {
            tick().then(() => {
                viewport.scrollTo(0, viewport.scrollHeight);
            });
        }
    });
</script>

<div
    class="fixed bottom-4 right-4 w-[600px] h-[700px] rounded-lg shadow-xl overflow-hidden border border-gray-200 dark:border-gray-800 flex flex-col bg-background"
>
    <header
        class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-blue-600"
    >
        <h2 class="text-lg font-semibold text-white">ChatBot</h2>
    </header>

    <div class="p-4 border-b border-gray-200 dark:border-gray-800">
        <div class="flex items-center gap-2">
            <p class="text-sm text-foreground">
                Freshness filter: {selectedDateFormatted}
            </p>
            <HoverCard.Root>
                <HoverCard.Trigger asChild>
                    <button
                        class="rounded-full focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                        <HelpCircle class="h-4 w-4 text-muted-foreground" />
                    </button>
                </HoverCard.Trigger>
                <HoverCard.Content class="w-80">
                    <div class="space-y-2">
                        <h4 class="text-sm font-semibold">
                            About Freshness Filter
                        </h4>
                        <p class="text-sm text-muted-foreground">
                            The freshness filter allows you to specify how
                            recent the vector database search should be. Only
                            documents updated after the selected date will be
                            used to answer your questions.
                        </p>
                    </div>
                </HoverCard.Content>
            </HoverCard.Root>
        </div>
        <DatePicker on:dateChange={handleDateChange} />
    </div>

    <!-- Modified viewport container -->
    <div bind:this={viewport} class="flex-1 overflow-y-auto p-4 space-y-4">
        {#each messages as message}
            <div
                class="flex gap-3 {message.type === 'user'
                    ? 'flex-row-reverse'
                    : 'flex-row'}"
            >
                <div class="flex-shrink-0">
                    <Avatar.Root class="h-10 w-10">
                        <Avatar.Image
                            src={message.type === "bot"
                                ? "/bot2.avif"
                                : "/man.avif"}
                            alt={message.type === "bot" ? "ChatBot" : "User"}
                        />
                        <Avatar.Fallback>
                            {message.type === "bot" ? "CB" : "U"}
                        </Avatar.Fallback>
                    </Avatar.Root>
                </div>

                <!-- Modified message container -->
                <div class="flex flex-col flex-1 max-w-[80%]">
                    <div
                        class="rounded-lg px-4 py-2 shadow-sm {message.type ===
                        'bot'
                            ? 'bg-secondary text-secondary-foreground'
                            : 'bg-primary text-primary-foreground'}"
                    >
                        {#if message.isLoading}
                            <div class="flex gap-1">
                                <Skeleton class="size-2 rounded-full" />
                                <Skeleton class="size-2 rounded-full" />
                                <Skeleton class="size-2 rounded-full" />
                            </div>
                        {:else}
                            <div
                                class="text-sm break-words [&>p]:leading-normal [&>p]:my-1"
                            >
                                <Markdown md={message.text} {plugins} />
                            </div>
                        {/if}
                    </div>
                    <span
                        class="text-xs text-muted-foreground mt-1 {message.type ===
                        'user'
                            ? 'text-right'
                            : 'text-left'}"
                    >
                        {formatTime(message.timestamp)}
                    </span>
                </div>
            </div>
        {/each}
    </div>

    <div class="border-t border-border p-4">
        <form
            class="relative rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring p-1"
            onsubmit={(e) => {
                e.preventDefault();
                handleSubmit();
            }}
        >
            <Input
                class="rounded-lg bg-background border-0 p-3 shadow-none focus-visible:ring-0"
                placeholder="Type your message (Enter to send)"
                bind:value={messageInput}
                disabled={isLoading}
            />
            <div class="flex justify-end p-2">
                <Button
                    type="submit"
                    disabled={isLoading || !messageInput.trim()}
                    size="sm"
                    class="gap-1.5"
                >
                    <span>Send</span>
                    <Send class="h-3.5 w-3.5" />
                </Button>
            </div>
        </form>
    </div>
</div>
