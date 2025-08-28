<script lang="ts">
  interface Props {
    period: string;
    description: string;
  }

  let { period, description }: Props = $props();
</script>

<!-- About item: 900x182px -->
<div class="w-[900px] h-[182px] relative">
  
  <!-- Period: position top-left, largeur variable x 40px -->
  <div class="absolute top-0 left-0 h-[40px] flex items-center">
    <h3 class="font-poppins font-semibold text-heading text-dark-blue leading-[1.67em]">
      {period}
    </h3>
  </div>
  
  <!-- Description: position x:17, y:50, 883x132px -->
  <div class="absolute top-[50px] left-[17px] w-[883px] h-[132px]">
    <p class="font-poppins font-normal text-body text-dark-blue leading-loose-custom">
      {description}
    </p>
  </div>
  
</div>