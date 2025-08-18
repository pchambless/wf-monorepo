import { getQueryEvents } from "../plans/queryIdx";
import { getLayoutEvents } from "../plans/layoutIDX";

export const getAllEvents = () => {
  return [
    ...getQueryEvents(),
    ...getLayoutEvents()
  ];
};

export {
  getQueryEvents,
  getLayoutEvents,
  getAllEvents
};