// Converts from id to actual naming within a source. If we could find a mapping
// inside the provided naming map, convert it to the actual naming, otherwise
// just use id for rendering.
export function mapSourceIdToName(
  id: string,
  idToNameMap: Record<string, string>,
) {
  return idToNameMap[id] || id
}
