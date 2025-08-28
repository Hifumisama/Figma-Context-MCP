<script lang="ts">
  import mediumIcon from '$lib/assets/medium-icon.svg';
  import behanceIcon from '$lib/assets/behance-icon.svg';
  import twitterIcon from '$lib/assets/twitter-icon.svg';

  interface Props {
    showLabels?: boolean;
  }

  let { showLabels = false }: Props = $props();
</script>

<!-- Social Media Icons: 98x17.8px avec gap 10px -->
<div class="w-[98px] h-[18px] flex gap-[10px] items-center">
  
  <!-- Medium: 26x15px -->
  <a href="https://medium.com" class="w-[26px] h-[15px] transition-opacity hover:opacity-70" target="_blank" rel="noopener noreferrer">
    <img src={mediumIcon} alt="Medium" class="w-full h-full object-contain" />
  </a>
  
  <!-- Behance: 26x16.1px -->
  <a href="https://behance.net" class="w-[26px] h-[16px] transition-opacity hover:opacity-70" target="_blank" rel="noopener noreferrer">
    <img src={behanceIcon} alt="Behance" class="w-full h-full object-contain" />
  </a>
  
  <!-- Twitter: 26x17.8px -->
  <a href="https://twitter.com" class="w-[26px] h-[18px] transition-opacity hover:opacity-70" target="_blank" rel="noopener noreferrer">
    <img src={twitterIcon} alt="Twitter" class="w-full h-full object-contain" />
  </a>
  
</div>