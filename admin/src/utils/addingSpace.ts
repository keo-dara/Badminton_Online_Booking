export default (first: string, second: string) => { 
  
  const { locale } = useI18n();

  if (locale.value === "en") {
    return `${first} ${second}`;
  }

  return `${first}${second}`;
}