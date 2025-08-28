<script lang="ts">
  import AboutTimelineItem from './AboutTimelineItem.svelte';

  interface Props {
    timelineItems?: Array<{
      period: string;
      description: string;
    }>;
  }

  let { 
    timelineItems = [
      {
        period: "2014-2018",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Amet vulputate tristique quam felis. Id phasellus dui orci vulputate consequat nulla proin. Id sit scelerisque neque, proin bibendum diam."
      },
      {
        period: "2018-2020", 
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Amet vulputate tristique quam felis. Id phasellus dui orci vulputate consequat nulla proin. Id sit scelerisque neque, proin bibendum diam."
      },
      {
        period: "2020 - Present",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Amet vulputate tristique quam felis. Id phasellus dui orci vulputate consequat nulla proin. Id sit scelerisque neque, proin bibendum diam."
      }
    ]
  }: Props = $props();
</script>

<!-- About container: 1246x566px avec alignItems: flex-end -->
<div class="w-[1246px] h-[566px] flex flex-col items-end gap-[10px] mt-[20px]">
  
  <!-- About list: 900x566px décalé à droite -->
  <div class="w-[900px] h-[566px] flex flex-col gap-[10px]">
    {#each timelineItems as item}
      <AboutTimelineItem period={item.period} description={item.description} />
    {/each}
  </div>
  
</div>