<script lang="ts">
  import profileImage from '$lib/assets/profile-image.png';

  interface Props {
    width?: number;
    height?: number;
    alt?: string;
  }

  let { width = 506, height = 509, alt = 'Profile Image' }: Props = $props();
</script>

<!-- Profile Image Container: 506x509px -->
<div class="relative" style="width: {width}px; height: {height}px;">
  
  <!-- Mask Group: position x:13, y:0, 493x493px -->
  <div class="absolute top-0 left-[13px] w-[493px] h-[493px] overflow-hidden rounded-full">
    <!-- Profile Image: 493x532px dans le mask -->
    <img 
      src={profileImage} 
      {alt}
      class="w-[493px] h-[532px] object-cover object-top"
    />
  </div>
  
  <!-- Vector border: position x:0, y:16, 493x493px -->
  <div class="absolute top-[16px] left-0 w-[493px] h-[493px] border border-black rounded-full pointer-events-none"></div>
  
</div>