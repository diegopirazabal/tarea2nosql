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

export async function reserveEventSeats(eventId, quantity, { session } = {}) {
  if (!quantity || quantity <= 0) {
    throw new Error("La cantidad debe ser un número mayor que cero.");
  }

  const updated = await EventModel.findOneAndUpdate(
    { _id: eventId, aforo_disponible: { $gte: quantity } },
    { $inc: { aforo_disponible: -quantity } },
    {
      new: true,
      session,
      lean: true,
      getters: true,
    }
  );

  if (!updated) {
    return null;
  }

  return formatEvent(updated);
}

export async function releaseEventSeats(eventId, quantity, { session } = {}) {
  if (!quantity || quantity <= 0) {
    throw new Error("La cantidad debe ser un número mayor que cero.");
  }

  const updated = await EventModel.findByIdAndUpdate(
    eventId,
    { $inc: { aforo_disponible: quantity } },
    {
      new: true,
      session,
      lean: true,
      getters: true,
    }
  );

  if (!updated) {
    return null;
  }

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
