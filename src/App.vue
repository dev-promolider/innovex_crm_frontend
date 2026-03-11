<template>
  <RouterView />
</template>

<style>
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
html, body {
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  background: #f0f2f5;
  font-family: 'Segoe UI', Arial, sans-serif;
}
#app {
  width: 100%;
  min-height: 100%;
  overflow-x: hidden;
}
</style>