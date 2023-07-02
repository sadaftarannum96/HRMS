import jsPDF from 'jspdf';
import moment from 'moment';
import {exportDefaultSlots} from './sampleCalendarData';

const hourToMin = (startTime) => {
  const [startHour, startMin] = (startTime || '').split(':');
  const totalMin = parseInt(startHour) * 60 + parseInt(startMin);
  return totalMin;
};

const getTotalMin = (startTime, endTime) => {
  const [startHour, startMin] = (startTime || '').split(':');
  const [endHour, endMin] = (endTime || '').split(':');
  const totalMin =
    parseInt(endHour) * 60 +
    parseInt(endMin) -
    parseInt(startHour) * 60 -
    parseInt(startMin);
  return totalMin;
};

const showingEvents = (doc, slot, x, y, width, height) => {
  let Y = y;
  let X = x;
  X += 5;
  let meetingName = slot?.type;
  let projectName = slot?.name;
  if (slot?.type === 'Audition' || slot?.type === 'Session') {
    meetingName = `${slot?.type} Schedule`;
    projectName = slot?.project;
  }
  doc.setFillColor('#FFFFFF');
  doc.roundedRect(x, y, width, height, 0, 0, 'FD');
  doc.setFontSize(7);
  doc.setTextColor('#f85c5c');
  Y += 10;
  doc.setFont(undefined, 'normal').text(meetingName || '', X, Y);
  doc.setTextColor('#000000');
  if (projectName) {
    Y += 10;
    doc
      .setFont(undefined, 'bold')
      .text(projectName || '', X, Y, {maxWidth: width - 15});
    Y += doc.getTextDimensions(projectName || '')?.h;
  }
  if (slot?.type === 'Audition' || slot?.type === 'Session') {
    Y += 5;
    doc
      .setFont(undefined, 'normal')
      .text(`Manager ${slot?.projectManager}` || '', X, Y);
    Y += doc.getTextDimensions(slot?.type || '')?.h;
  }
  if (slot?.status) {
    Y += 5;
    doc.setFont(undefined, 'normal').text(slot?.status || '', X, Y);
  }
  Y += 10;
  doc
    .setFont(undefined, 'normal')
    .text(`${slot?.startTime} - ${slot?.endTime}` || '', X, Y);
};

const giveOneSlot = (doc, name, x, y, width, height) => {
  doc.setFillColor('#f2f2f2');
  doc.setDrawColor('#dbdbdb');
  doc.roundedRect(x, y, width, height, 0, 0, 'FD');
  doc.setTextColor('##000000');
  const w = doc.getTextDimensions(name || '')?.w;
  doc.text(name || '', x + 40 - w / 2, y + 18);
};

const giveTimingSlot = (doc, name, x, y, roomData, index) => {
  doc.setFillColor('#f2f2f2');
  doc.setDrawColor('#dbdbdb');
  doc.roundedRect(x, y, 80, 60, 0, 0, 'FD');
  doc.setTextColor('##000000');
  const w = doc.getTextDimensions(name || '')?.w;
  doc.text(name || '', x + 40 - w / 2, y + 33);
  x += 80;
  (roomData || []).forEach((item, i) => {
    giveOneSlot(doc, item?.name, x, y, 80, 60);
    x += 80;
  });
};
export const handlePrint = (
  timezoneList,
  timezoneId,
  selectedDate,
  roomData,
  startTime,
  endTime,
) => {
  const timezone = (timezoneList || []).find((t) => t.id === timezoneId);
  var doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    size: 'a4', //595 × 842 points
  });

  const height = doc.internal.pageSize.getHeight();
  const headingFontSize = 10;
  let x = 30;
  let y = 20;

  //main headings
  doc.setFontSize(headingFontSize);
  doc
    .setFont(undefined, 'bold')
    .text('Date:-', x, y)
    .setFont(undefined, 'normal');
  x += 30;
  doc.text(moment(selectedDate).format('DD-MM-YYYY') || '', x, y);
  const w = doc.getTextDimensions(
    moment(selectedDate).format('DD-MM-YYYY') || '',
  )?.w;
  x += w + 10;
  doc
    .setFont(undefined, 'bold')
    .text('Timezone:-', x, y)
    .setFont(undefined, 'normal');
  x += 55;
  doc.text(timezone?.timezone || '', x, y);

  const timezoneWidth = doc.getTextDimensions(timezone?.timezone || '')?.w;
  x += timezoneWidth + 10;
  //start time
  doc
    .setFont(undefined, 'bold')
    .text('Start Time:-', x, y)
    .setFont(undefined, 'normal');
  x += 58;
  doc.text(startTime || '', x, y);

  const startTimeWidth = doc.getTextDimensions(startTime || '')?.w;
  x += startTimeWidth + 10;

  //end time
  doc
    .setFont(undefined, 'bold')
    .text('End Time:-', x, y)
    .setFont(undefined, 'normal');
  x += 55;
  doc.text(endTime || '', x, y);

  //after main headings end
  x = 30;
  y += 20;

  giveOneSlot(doc, 'Time', x, y, 80, 60);
  x += 80;
  (roomData || []).forEach((room) => {
    giveOneSlot(doc, room?.studioRoom, x, y, 80, 60);
    x += 80;
  });

  x = 30;
  y += 30;

  const startTimeIndex = exportDefaultSlots.findIndex((item) =>
    moment(item?.split(' ')?.[0], 'HH:mm').isSameOrAfter(
      moment(startTime, 'HH:mm'),
    ),
  );
  const endTimeIndex = exportDefaultSlots.findIndex((item) =>
    moment(item?.split(' ')?.[0], 'HH:mm').isSameOrAfter(
      moment(endTime, 'HH:mm'),
    ),
  );

  let updatedTimingSlots = [...exportDefaultSlots];
  if (startTimeIndex >= 0 && endTimeIndex >= 0) {
    updatedTimingSlots = exportDefaultSlots.slice(startTimeIndex, endTimeIndex);
  }

  // give timing slots
  updatedTimingSlots.forEach((time, i) => {
    giveTimingSlot(doc, time, x, y, roomData, i);
    y += 60;
    if (y >= height - 60) {
      doc.insertPage();
      y = 20;
    }
  });

  //showing events
  doc.setPage(1);
  x = 110;
  y = 70;
  (roomData || []).forEach((room) => {
    (room?.slots || []).forEach((slot) => {
      const totalMin = getTotalMin(slot?.startTime, slot?.endTime);
      const minutes = hourToMin(slot?.startTime);
      y += minutes * 2;
      if (startTimeIndex >= 0) {
        y -= startTimeIndex * 60; //removing timing slots height from y
      }
      const pageNumber = Math.floor(y / 540);
      if (pageNumber) {
        doc.setPage(pageNumber + 1);
        y = minutes * 2 - 540 * pageNumber + 80;
        if (startTimeIndex >= 0) {
          y -= startTimeIndex * 60; //removing timing slots height from y
        }
      }
      if (startTime === '' || endTime === '') {
        showingEvents(doc, slot, x, y, 80, totalMin <= 30 ? 60 : totalMin * 2);
      } else {
        hourToMin(endTime) >= hourToMin(slot?.endTime) &&
          showingEvents(
            doc,
            slot,
            x,
            y,
            80,
            totalMin <= 30 ? 60 : totalMin * 2,
          ); //120 is height of one slot  and 80 is width of one slot
      }
    });
    x += 80; //change x position for next room
  });

  doc.save(`Calendar_${Date.now()}.pdf`);
  return true;
};
