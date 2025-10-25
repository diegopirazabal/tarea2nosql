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

export async function reserveSeats(eventId, cantidad) {
  const updated = await EventModel.findOneAndUpdate(
    { _id: eventId, aforo_disponible: { $gte: cantidad } },
    { $inc: { aforo_disponible: -cantidad } },
    { new: true }
  ).lean({ getters: true });
  if (!updated) return null;
  return formatEvent(updated);
}

export async function revertSeats(eventId, cantidad) {
  const updated = await EventModel.findOneAndUpdate(
    { _id: eventId },
    { $inc: { aforo_disponible: cantidad } },
    { new: true }
  ).lean({ getters: true });
  if (!updated) return null;
  return formatEvent(updated);
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
