export const calculateDataBookends = (length, page, action) => {
  let start;
  let end;
  let gap;

  switch (action) {
    case 'next':
      gap = page === 1 ? 1 : 2;
      start = length * page + gap;
      end = length * (page + 1) + gap;
      break;
    case 'previous':
      if (page === 2) {
        start = 0;
        end = 8;
      } else {
        gap = page === 3 ? 1 : 2;
        start = length * (page - 2) + gap;
        end = length * (page - 1) + gap;
      }

      break;
    default:
      break;
  }
  console.log(`gaps-| start:${start} : end:${end}`);
  return [start, end];
};
