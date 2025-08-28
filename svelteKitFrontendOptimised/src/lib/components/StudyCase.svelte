<script lang="ts">
  interface Props {
    imageSrc: string;
    date: string;
    title: string;
    description: string;
    imageAlt?: string;
  }

  let { imageSrc, date, title, description, imageAlt = 'Study Case Image' }: Props = $props();
</script>

<!-- StudyCase: 560x614px -->
<div class="w-[560px] h-[614px] relative">
  
  <!-- Image: 560x400px -->
  <div class="absolute top-0 left-0 w-[560px] h-[400px]">
    <img 
      src={imageSrc} 
      alt={imageAlt}
      class="w-full h-full object-cover"
    />
  </div>
  
  <!-- Date: position y:410, 141x44px -->
  <div class="absolute top-[410px] left-0 w-[141px] h-[44px] flex items-center">
    <p class="font-poppins font-normal text-body-tiny text-dark-blue leading-extra-loose">
      {date}
    </p>
  </div>
  
  <!-- Title: position y:464, 215x44px -->
  <div class="absolute top-[464px] left-0 w-[215px] h-[44px] flex items-center">
    <h3 class="font-poppins font-semibold text-heading text-dark-blue leading-loose-custom">
      {title}
    </h3>
  </div>
  
  <!-- Description: position y:518, 560x96px -->
  <div class="absolute top-[518px] left-0 w-[560px] h-[96px]">
    <p class="font-poppins font-normal text-body-small text-dark-blue leading-[1.78em]">
      {description}
    </p>
  </div>
  
</div>