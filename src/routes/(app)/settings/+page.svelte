<script lang="ts">
    import type { PageData } from './$types';
    
    export let data: PageData;
</script>

<h1>Settings</h1>

<label for="myBrowser">Choose a browser from this list:</label>
<input list="browsers" id="myBrowser" name="myBrowser" />
<datalist id="browsers">
  <option value="Chrome"></option>
  <option value="Firefox"></option>
  <option value="Opera"></option>
  <option value="Safari"></option>
  <option value="Microsoft Edge"></option>
</datalist>

<!-- <div class="select-editable">
    <select onchange="this.nextElementSibling.value=this.value">
      <option value=""></option>
      <option value="115x175 mm">115x175 mm</option>
      <option value="120x160 mm">120x160 mm</option>
      <option value="120x287 mm">120x287 mm</option>
    </select>
    <input type="text" name="format" value=""/>
  </div> -->