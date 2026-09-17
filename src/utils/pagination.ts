export type PaginationItem = number | "ellipsis";

export const getPaginationItems = (
  page: number,
  totalPages: number,
): PaginationItem[] => {
  if (totalPages <= 7)
    return Array.from({ length: totalPages }, (_, index) => index + 1);

  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  const orderedPages = [...pages]
    .filter((candidate) => candidate >= 1 && candidate <= totalPages)
    .sort((left, right) => left - right);

  return orderedPages.flatMap((candidate, index) => {
    const previous = orderedPages[index - 1];
    return previous !== undefined && candidate - previous > 1
      ? ["ellipsis", candidate]
      : [candidate];
  });
};
