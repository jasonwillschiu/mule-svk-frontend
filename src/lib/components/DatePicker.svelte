<script>
    import CalendarIcon from "lucide-svelte/icons/calendar";
    import XCircleIcon from "lucide-svelte/icons/x-circle"; // Import clear icon
    import { DateFormatter, getLocalTimeZone } from "@internationalized/date";
    import { cn } from "$lib/utils.js";
    import { buttonVariants } from "$lib/components/ui/button/index.js";
    import { Calendar } from "$lib/components/ui/calendar/index.js";
    import * as Popover from "$lib/components/ui/popover/index.js";
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    const df = new DateFormatter("en-US", {
        dateStyle: "long",
    });

    let selectedDateValue = null; // Initialize to null for no default date
    let contentRef;

    $: selectedDateFormatted = selectedDateValue
        ? `${selectedDateValue.year}-${String(selectedDateValue.month).padStart(2, "0")}-${String(selectedDateValue.day).padStart(2, "0")}`
        : null;

    $: dispatch("dateChange", selectedDateFormatted); // Dispatch event on date change

    function clearDate() {
        selectedDateValue = null; // Function to clear the selected date
    }
</script>

<Popover.Root>
    <Popover.Trigger
        class={cn(
            buttonVariants({
                variant: "outline",
                size: "sm",
                class: "w-[220px] justify-start text-left font-normal",
            }),
            !selectedDateValue && "text-muted-foreground",
        )}
    >
        <CalendarIcon class="mr-2 h-4 w-4" />
        {#if selectedDateValue}
            {df.format(selectedDateValue.toDate(getLocalTimeZone()))}
        {:else}
            Pick a date
        {/if}
    </Popover.Trigger>
    <Popover.Content bind:this={contentRef} class="w-auto p-0">
        <div class="flex justify-end p-2">
            {#if selectedDateValue}
                <button
                    class="text-sm text-red-500 hover:text-red-700 flex items-center"
                    on:click={clearDate}
                    type="button"
                >
                    <XCircleIcon class="mr-1 h-4 w-4" /> Clear
                </button>
            {/if}
        </div>
        <Calendar type="single" bind:value={selectedDateValue} />
    </Popover.Content>
</Popover.Root>
