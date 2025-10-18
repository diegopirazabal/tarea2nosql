import { EventModel } from "../models/eventModel.js";

export async function createEvent(eventData) {
  const event = new EventModel(eventData);
  await event.validate();
  await event.save();
  return event.toJSON();
}

export async function findEventById(eventId) {
  const event = await EventModel.findById(eventId).lean({ getters: true });
  if (!event) {
    return null;
  }
  return formatEvent(event);
}

function formatEvent(event) {
  if (!event) {
    return null;
  }

  if (event._id && !event.id) {
    event.id = event._id.toString();
    delete event._id;
  }

  return event;
}
