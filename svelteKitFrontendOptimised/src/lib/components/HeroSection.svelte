<script lang="ts">
  import ProfileImage from '$lib/components/ProfileImage.svelte';
  import Button from '$lib/components/Button.svelte';

  interface Props {
    greeting?: string;
    title?: string;
    location?: string;
  }

  let { 
    greeting = "Hello, I'm John,", 
    title = "Product Designer", 
    location = "based in Netherland." 
  }: Props = $props();
</script>

<!-- Hero Frame: 1246x509px avec layout row, space-between, center -->
<section class="w-[1246px] h-[509px] flex justify-between items-center gap-[10px]">
  
  <!-- Descriptive text: 616x336px -->
  <div class="w-[616px] h-[336px] flex flex-col justify-center gap-[10px]">
    
    <!-- Hello text: 211x42px -->
    <h2 class="w-[211px] h-[42px] font-poppins font-medium text-hero-subtitle text-dark-blue leading-relaxed-custom flex items-center">
      {greeting}
    </h2>
    
    <!-- Product Designer: 616x232px - ÉNORME ! -->
    <h1 class="w-[616px] h-[232px] font-poppins font-extrabold text-hero-title text-dark-blue leading-hero-tight flex items-end">
      {title}
    </h1>
    
    <!-- Location text: 294x42px -->
    <h2 class="w-[294px] h-[42px] font-poppins font-medium text-hero-subtitle text-dark-blue leading-relaxed-custom flex items-center">
      {location}
    </h2>
    
  </div>
  
  <!-- Profile Image: 506x509px -->
  <div class="w-[506px] h-[509px]">
    <ProfileImage width={506} height={509} />
  </div>
  
</section>

<!-- Button Resume positionné séparément selon Figma -->
<div class="w-[164px] h-[68px] mt-[46px]">
  <Button text="Resume" variant="active" />
</div>