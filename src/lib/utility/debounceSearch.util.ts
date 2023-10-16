const debounce = (func: Function, delay: number) => {
  let timeoutId: string | number | NodeJS.Timeout | undefined;

  return (...args: any) => {
    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};

const search = (e: { target: { form: { requestSubmit: () => void } } }) => {
  e.target.form.requestSubmit();
};

export const debounceSearch = debounce(search, 400);