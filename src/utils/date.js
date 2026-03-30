export function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function formatTimeRange(startTime, endTime) {
  return `${startTime} - ${endTime}`;
}

export function groupSlotsByCity(slots) {
  return slots.reduce((acc, slot) => {
    if (!acc[slot.city]) acc[slot.city] = [];
    acc[slot.city].push(slot);
    return acc;
  }, {});
}

export function sortByCreatedAtDesc(items) {
  return [...items].sort((a, b) => {
    const aValue = a.createdAt?.seconds || 0;
    const bValue = b.createdAt?.seconds || 0;
    return bValue - aValue;
  });
}

export function sortSlotsByDateAsc(items) {
  return [...items].sort((a, b) => {
    const aValue = new Date(`${a.date}T${a.startTime || '00:00'}`).getTime();
    const bValue = new Date(`${b.date}T${b.startTime || '00:00'}`).getTime();
    return aValue - bValue;
  });
}
