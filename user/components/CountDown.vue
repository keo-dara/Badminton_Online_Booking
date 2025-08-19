<template>
  <div>{{ timerOutput }}</div>
</template>

<script setup lang="ts">
  const timerOutput = ref('');

  const props = defineProps<{ bookingAt: string }>();

  function startTimer() {
    const eightMinuteInMillisecond = 8 * 60 * 1000;
    const startTime = new Date(props.bookingAt);
    const endTime = new Date(startTime.getTime() + eightMinuteInMillisecond);
    const timeDifference = endTime.getTime() - startTime.getTime();

    const millisecondsInOneSecond = 1000;
    const millisecondsInOneMinute = millisecondsInOneSecond * 60;
    const millisecondsInOneHour = millisecondsInOneMinute * 60;

    const remainderDifferenceInMinutes =
      (timeDifference % millisecondsInOneHour) / millisecondsInOneMinute;
    const remainderDifferenceInSeconds =
      (timeDifference % millisecondsInOneMinute) / millisecondsInOneSecond;
    const remainingMinutes = Math.floor(remainderDifferenceInMinutes);
    const remainingSeconds = Math.floor(remainderDifferenceInSeconds);

    timerOutput.value = remainingMinutes + ' ' + ': ' + remainingSeconds + ' ';
  }

  onMounted(() =>
    setInterval(() => {
      startTimer();
    }, 1000)
  );
</script>

<style scoped></style>
