<script lang="ts">
  import SocialIcons from './SocialIcons.svelte';

  interface Props {
    name?: string;
  }

  let { name = 'John Doe' }: Props = $props();
</script>

<!-- Header: 1246x36px avec layout row, space-between, center -->
<header class="w-[1246px] h-[36px] flex justify-between items-center gap-[10px]">
  
  <!-- Logo/Name: 114x36px -->
  <div class="w-[114px] h-[36px] flex items-center">
    <h1 class="font-poppins font-semibold text-name text-dark-blue leading-relaxed-custom">
      {name}
    </h1>
  </div>

  <!-- Navigation Menu: 276x27px avec gap 61px -->
  <nav class="w-[276px] h-[27px] flex justify-center items-center gap-[61px]">
    <a 
      href="#home" 
      class="w-[54px] h-[27px] font-poppins font-normal text-body-small text-dark-blue leading-relaxed-custom hover:opacity-70 transition-opacity flex items-center"
    >
      Home
    </a>
    <a 
      href="#about" 
      class="w-[54px] h-[27px] font-poppins font-normal text-body-small text-dark-blue leading-relaxed-custom hover:opacity-70 transition-opacity flex items-center"
    >
      About
    </a>
    <a 
      href="#work" 
      class="w-[46px] h-[27px] font-poppins font-normal text-body-small text-dark-blue leading-relaxed-custom hover:opacity-70 transition-opacity flex items-center"
    >
      Work
    </a>
  </nav>

  <!-- Social Media Icons: 98x17.8px -->
  <div class="w-[98px] h-[18px] flex items-center">
    <SocialIcons />
  </div>
  
</header>