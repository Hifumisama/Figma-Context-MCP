<script lang="ts">
  interface Props {
    text?: string;
    href?: string;
    variant?: 'active' | 'clicked';
    onclick?: () => void;
  }

  let { text = 'Resume', href, variant = 'active', onclick }: Props = $props();
</script>

<div class="relative inline-block">
  {#if href}
    <a 
      {href}
      class="relative block w-[164px] h-[68px] transition-all duration-200 cursor-pointer"
      {onclick}
    >
      <!-- Background -->
      <div 
        class="absolute top-[7px] left-[6px] w-[158px] h-[61px] rounded-button transition-all duration-200 bg-yellow-brand"
      ></div>
      
      <!-- Outline -->
      <div 
        class="absolute top-0 left-0 w-[158px] h-[61px] border border-dark-brown rounded-button transition-all duration-200"
        class:bg-transparent={variant === 'active'}
        class:bg-yellow-brand={variant === 'clicked'}
      ></div>
      
      <!-- Button Text -->
      <div class="absolute top-[16px] left-[38px] w-[81px] h-[30px] flex items-center justify-center">
        <span class="font-poppins font-normal text-button text-dark-brown leading-relaxed-custom">
          {text}
        </span>
      </div>
    </a>
  {:else}
    <button 
      class="relative block w-[164px] h-[68px] transition-all duration-200 cursor-pointer"
      {onclick}
    >
      <!-- Background -->
      <div 
        class="absolute top-[7px] left-[6px] w-[158px] h-[61px] rounded-button transition-all duration-200 bg-yellow-brand"
      ></div>
      
      <!-- Outline -->
      <div 
        class="absolute top-0 left-0 w-[158px] h-[61px] border border-dark-brown rounded-button transition-all duration-200"
        class:bg-transparent={variant === 'active'}
        class:bg-yellow-brand={variant === 'clicked'}
      ></div>
      
      <!-- Button Text -->
      <div class="absolute top-[16px] left-[38px] w-[81px] h-[30px] flex items-center justify-center">
        <span class="font-poppins font-medium text-button text-dark-brown leading-relaxed-custom">
          {text}
        </span>
      </div>
    </button>
  {/if}
</div>