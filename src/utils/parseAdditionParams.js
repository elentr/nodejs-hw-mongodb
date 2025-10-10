export function parseSortParams(query) {
  const { sortBy = 'name', sortOrder = 'asc' } = query;

  const order = sortOrder.toLowerCase() === 'desc' ? -1 : 1;

  return { [sortBy]: order };
}

export function parseFilterParams(query) {
  const filter = {};

  if (query.type) {
    filter.contactType = query.type;
  }

  if (query.isFavourite) {
    filter.isFavourite = query.isFavourite === 'true';
  }
  return filter;
}
