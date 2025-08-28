<script lang="ts">
  import contactImage from '$lib/assets/contact-image.png';

  interface Props {
    description?: string;
    email?: string;
    twitter?: string;
    behance?: string;
  }

  let { 
    description = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Amet vulputate tristique quam felis. Id phasellus dui orci vulputate consequat nulla proin. Id sit scelerisque neque, proin bibendum diam.",
    email = "johndoe@mail.com",
    twitter = "twitter.com/johndoe",
    behance = "behance.com/johndoe"
  }: Props = $props();
</script>

<!-- Contact Container: 1121x338px avec layout row, space-between, gap 10px -->
<div class="w-[1121px] h-[338px] flex justify-between gap-[10px] mt-[10px]">
  
  <!-- Contact Image: 456x284px -->
  <div class="w-[456px] h-[284px]">
    <img 
      src={contactImage} 
      alt="Contact"
      class="w-full h-full object-cover"
    />
  </div>
  
  <!-- Text Contact Container: 640x338px -->
  <div class="w-[640px] h-[338px] flex flex-col gap-[10px]">
    
    <!-- Description: 640x176px -->
    <div class="w-[640px] h-[176px]">
      <p class="font-poppins font-normal text-body text-dark-blue leading-loose-custom">
        {description}
      </p>
    </div>
    
    <!-- Email: 640x44px -->
    <div class="w-[640px] h-[44px] flex items-center">
      <a 
        href="mailto:{email}" 
        class="font-poppins font-normal text-body text-dark-blue leading-loose-custom hover:opacity-70 transition-opacity"
      >
        {email}
      </a>
    </div>
    
    <!-- Twitter: 640x44px -->
    <div class="w-[640px] h-[44px] flex items-center">
      <a 
        href="https://{twitter}" 
        target="_blank"
        rel="noopener noreferrer"
        class="font-poppins font-normal text-body text-dark-blue leading-loose-custom hover:opacity-70 transition-opacity"
      >
        {twitter}
      </a>
    </div>
    
    <!-- Behance: 640x44px -->
    <div class="w-[640px] h-[44px] flex items-center">
      <a 
        href="https://{behance}" 
        target="_blank"
        rel="noopener noreferrer"
        class="font-poppins font-normal text-body text-dark-blue leading-loose-custom hover:opacity-70 transition-opacity"
      >
        {behance}
      </a>
    </div>
    
  </div>
  
</div>