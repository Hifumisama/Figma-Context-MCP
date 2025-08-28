<script lang="ts">
  import StudyCase from './StudyCase.svelte';
  import studyCase1 from '$lib/assets/study-case-1.png';
  import studyCase2 from '$lib/assets/study-case-2.png';

  interface Props {
    studyCases?: Array<{
      imageSrc: string;
      date: string;
      title: string;
      description: string;
    }>;
  }

  let { 
    studyCases = [
      {
        imageSrc: studyCase1,
        date: "November 24, 2019",
        title: "Some Case Study",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut sed aliquam sollicitudin rhoncus morbi. Tincidunt quam sem elit a convallis. Eget ipsum, velit vitae eu nunc, consequat, at."
      },
      {
        imageSrc: studyCase2,
        date: "November 24, 2019", 
        title: "Some Case Study",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut sed aliquam sollicitudin rhoncus morbi. Tincidunt quam sem elit a convallis. Eget ipsum, velit vitae eu nunc, consequat, at."
      }
    ]
  }: Props = $props();
</script>

<!-- Studycase container: 1246x614px avec layout row, space-between, gap 10px -->
<div class="w-[1246px] h-[614px] flex justify-between gap-[10px] mt-[10px]">
  {#each studyCases as studyCase}
    <StudyCase 
      imageSrc={studyCase.imageSrc}
      date={studyCase.date}
      title={studyCase.title}
      description={studyCase.description}
    />
  {/each}
</div>