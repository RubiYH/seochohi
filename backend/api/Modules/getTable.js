module.exports = function getTable(table) {
  let getTable;

  switch (table) {
    case "s1":
      getTable = "s1";
      break;
    case "s2":
      getTable = "s2";
      break;
    case "s3":
      getTable = "s3";
      break;
    case "event_notes":
      getTable = "event_notes";
      break;
    default:
      getTable = null;
      break;
  }

  return getTable;
};
