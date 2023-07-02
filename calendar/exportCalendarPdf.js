import jsPDF from 'jspdf';
import moment from 'moment';
import SideLogo from '../images/Side-images/Green/SideLogo.png';

const getOneSection = (
  x,
  y,
  doc,
  width,
  head,
  body,
  headingFontSize,
  subHeadingFontSize,
  section,
  room,
) => {
  if (y > 400) {
    doc.insertPage();
    y = 25;
  }
  y += 30;
  x += 25;
  const textGap =
    section?.type === 'Audition' || section?.type === 'Session' ? 5 : 8;
  const maximumWidth = 100;
  const meetingName = `${section?.type}`;
  const projectName = section?.project;
  let textColor = '#f19f4e'; //by default for other meeting
  if (section?.type === 'Audition') textColor = '#91cf00';
  else if (section?.type === 'Session') textColor = '#f85c5c';
  doc.setFillColor('#FFFFFF');
  doc.setDrawColor(textColor);
  doc.setLineWidth(1);
  doc.setFontSize(8);
  doc.setTextColor(textColor);

  // if (projectName) {
  //   y += textGap;
  //   doc
  //     .setFont(undefined, 'normal')
  //     .text(meetingName || '', x, y, {maxWidth: maximumWidth});
  //   x +=
  //     doc.getTextDimensions(meetingName || '', {maxWidth: maximumWidth})?.w +
  //     10;
  //   doc.setFont(undefined, 'normal').text('-' || '', x, y);
  //   x += 10;
  //   doc
  //     .setFont(undefined, 'bold')
  //     .text(projectName || '', x, y, {maxWidth: maximumWidth});
  //   y += doc.getTextDimensions(projectName || '', {maxWidth: maximumWidth})?.h;
  // }

  y += textGap + 5;
  x = 40;
  doc.setTextColor('#000000');
  doc.setFillColor('#91CF00');
  doc.roundedRect(x, y, width - 80, 25, 3, 3, 'F');
  y += 15;
  doc.setTextColor('#ffffff');
  doc.setFontSize(subHeadingFontSize);
  // doc
  //   .setFont(undefined, 'bold')
  //   .text('Talent Schedule', x + 15, y)
  //   .setFont(undefined, 'normal');
  // doc.setFontSize(subHeadingFontSize);
  // x +=
  //   doc.getTextDimensions('Talent Schedule', {maxWidth: maximumWidth})?.w + 23;
  doc
    .setFont(undefined, 'bold')
    .text(meetingName || '', x + 15, y, {maxWidth: maximumWidth});
    doc.setFontSize(subHeadingFontSize);
  x +=
    doc.getTextDimensions(meetingName || '', {maxWidth: maximumWidth})?.w + 20;
  doc.setFont(undefined, 'bold').text('-' || '', x, y);
  x += 10;
  doc
    .setFont(undefined, 'bold')
    .text(projectName || '', x, y, {maxWidth: maximumWidth});
  x +=
    doc.getTextDimensions(projectName || '', {maxWidth: maximumWidth})?.w + 10;
  doc.setFont(undefined, 'normal').text('-' || '', x, y);
  x += 10;
  doc
    .setFont(undefined, 'bold')
    .text(`${room.studio}` || '', x, y, {maxWidth: maximumWidth});
  x +=
    doc.getTextDimensions(`${room.studio}`, {maxWidth: maximumWidth})?.w + 2;
  doc
    .setFont(undefined, 'normal')
    .text(`(${room.studioRoom})` || '', x, y, {maxWidth: maximumWidth});
  x +=
    doc.getTextDimensions(`${room.studioRoom}` || '', {maxWidth: maximumWidth})
      ?.w + 10;

  y += doc.getTextDimensions(projectName || '', {maxWidth: maximumWidth})?.h;
  // y += 13;
  doc.autoTable({
    startY: y,
    styles: {
      overflow: 'linebreak',
    },
    headStyles: {fillColor: '#212529', fontSize: 8},
    head: [head],
    body: body,
    didParseCell: function (data) {
      if (data.section === 'body') {
        data.cell.styles.fillColor = '#F0F0F0';
        data.cell.styles.fontSize = 8;
      }
      if (data.section === 'head') {
        data.cell.styles.minCellHeight = 25;
        data.cell.styles.valign = 'middle';
      }
    },
    theme: 'grid',
  });
  x += 315;
  y = doc.lastAutoTable.finalY;
  return {currentX: x, currentY: y};
};

const showingEvents = (doc, slot, x, y, width, height, showEquipment) => {
  let Y = y;
  let X = x;
  const maximumWidth = 100;
  const textGap = slot?.type === 'Audition' || slot?.type === 'Session' ? 5 : 8;
  X += 5;
  let meetingName = slot?.type;
  let projectName = slot?.name;
  if (slot?.type === 'Audition' || slot?.type === 'Session') {
    meetingName = `${slot?.type} Schedule`;
    projectName = slot?.project;
  }
  let textColor = '#f19f4e'; //by default for other meeting
  if (slot?.type === 'Audition') textColor = '#91cf00';
  else if (slot?.type === 'Session') textColor = '#f85c5c';
  else if (slot?.type === 'Prep Meeting') textColor = '#9a4ef1';
  else if (slot?.type === 'Meeting') textColor = '#3fb6e9';
  doc.setFillColor('#FFFFFF');
  doc.setDrawColor(textColor);
  doc.setLineWidth(1);
  doc.roundedRect(x, y + 1, width - 2, height - 2, 5, 5, 'FD'); //here 1 & 2 are for border width
  doc.setFontSize(8);
  doc.setTextColor(textColor);
  Y += textGap + 5;
  doc.setFont(undefined, 'normal').text(meetingName || '', X, Y);
  Y += doc.getTextDimensions(meetingName || '')?.h;
  doc.setTextColor('#000000');
  if (projectName) {
    Y += textGap;
    doc
      .setFont(undefined, 'bold')
      .text(projectName || '', X, Y, {maxWidth: maximumWidth});
    Y += doc.getTextDimensions(projectName || '', {maxWidth: maximumWidth})?.h;
  }
  if (slot?.projectUniqueId) {
    Y += textGap;
    doc
      .setFont(undefined, 'normal')
      .text(slot?.projectUniqueId || '', X, Y, {maxWidth: maximumWidth});
    Y += doc.getTextDimensions(slot?.projectUniqueId || '', {
      maxWidth: maximumWidth,
    })?.h;
  }
  if (slot?.status) {
    Y += textGap;
    doc.setFont(undefined, 'normal').text(slot?.status || '', X, Y);
    Y += doc.getTextDimensions(slot?.status || '')?.h;
  }
  if (
    (slot?.type === 'Audition' || slot?.type === 'Session') &&
    slot?.projectManager
  ) {
    Y += textGap;
    doc
      .setFont(undefined, 'normal')
      .text(`Manager: ${slot?.projectManager}` || '', X, Y, {
        maxWidth: maximumWidth,
      });
    Y += doc.getTextDimensions(`Manager: ${slot?.projectManager}` || '', {
      maxWidth: maximumWidth,
    })?.h;
  }
  Y += textGap;
  doc
    .setFont(undefined, 'normal')
    .text(`${slot?.startTime} - ${slot?.endTime}` || '', X, Y);
  Y += doc.getTextDimensions(`${slot?.startTime} - ${slot?.endTime}` || '')?.h;
  if (slot?.type === 'Session' && slot?.client) {
    Y += textGap;
    doc
      .setFont(undefined, 'normal')
      .text(`Client: ${slot?.client}` || '', X, Y, {
        maxWidth: maximumWidth,
      });
    Y += doc.getTextDimensions(`Client: ${slot?.client}` || '', {
      maxWidth: maximumWidth,
    })?.h;
  }
  if (
    (slot?.type === 'Audition' || slot?.type === 'Session') &&
    slot?.engineer?.length
  ) {
    let name = slot.engineer.length > 1 ? 'Engineers' : 'Engineer';
    Y += textGap;
    doc.setFont(undefined, 'normal').text(
      `${name}: ${slot?.engineer
        ?.slice(0, 2)
        ?.map((d) => d.engineerName)
        .join(', ')}` || '',
      X,
      Y,
      {maxWidth: 90},
    );
    Y += doc.getTextDimensions(
      `Engineers: ${slot?.engineer
        ?.slice(0, 2)
        ?.map((d) => d.engineerName)
        .join(', ')}` || '',
      {
        maxWidth: 90,
      },
    )?.h;
  }
  if (
    (slot?.type === 'Audition' || slot?.type === 'Session') &&
    slot?.director
  ) {
    Y += textGap;
    doc
      .setFont(undefined, 'normal')
      .text(`Director: ${slot?.director}` || '', X, Y, {
        maxWidth: maximumWidth,
      });
    Y += doc.getTextDimensions(`Director: ${slot?.director}` || '', {
      maxWidth: 90,
    })?.h;
  }
};

const giveOneSlot = (doc, x, y, roomWidth, roomHeight) => {
  doc.setFillColor('#f2f2f2');
  doc.setDrawColor('#dbdbdb');
  doc.roundedRect(x, y, roomWidth, roomHeight, 0, 0, 'FD');
  doc.setTextColor('#000000');
};

const giveRoomSlot = (
  doc,
  name,
  x,
  y,
  roomWidth,
  roomHieght,
  slotData,
  showEquipment,
) => {
  doc.setFillColor('#f2f2f2');
  doc.setDrawColor('#dbdbdb');
  doc.roundedRect(x, y, roomWidth, roomHieght, 0, 0, 'FD');
  doc.setTextColor('#000000');
  doc.setFontSize(10);
  const w = doc.getTextDimensions(name || '')?.w;
  doc.text(name || '', x + roomWidth / 2 - w / 2, y + roomHieght / 2 + 3);
  x += roomWidth;
  slotData.forEach((slot, i) => {
    giveOneSlot(doc, x, y, roomWidth, roomHieght);
    slot &&
      showingEvents(doc, slot, x, y, roomWidth, roomHieght, showEquipment);
    x += roomWidth;
  });
};

export const handlePrint = (
  timezoneList,
  timezoneId,
  selectedDate,
  data,
  startTime,
  endTime,
  showEquipment,
) => {
  const roomData = data.map((room) => {
    return {
      ...room,
      slots: room.slots
        .filter((s) =>
          startTime && endTime
            ? moment(s.startTime, 'HH:mm').isSameOrAfter(
                moment(startTime, 'HH:mm'),
              ) &&
              moment(s.endTime, 'HH:mm').isSameOrBefore(
                moment(endTime, 'HH:mm'),
              ) &&
              s.endTime !== '00:00'
            : s,
        )
        .sort(function (a, b) {
          return a.startTime.localeCompare(b.startTime);
        }),
    };
  });

  const timezone = (timezoneList || []).find((t) => t.id === timezoneId);
  var doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    size: 'a4', //595 × 842 points
  });

  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  const headingFontSize = 10;
  let x = 15;
  let y = 20;
  //main headings
  doc.setTextColor('#000000');
  doc.addImage(SideLogo, 'png', x, y + 7.5, 40, 20);
  x = width - 15 - 180; //180 left side text width //15 right side margin
  //line for right side text
  doc.setDrawColor('#dbdbdb');
  doc.setLineWidth(0.1);
  doc.line(x - 5, y - 5, x - 5, y + 30);
  doc.setFontSize(headingFontSize);
  //Date text
  doc
    .setFont(undefined, 'bold')
    .text('Date:-', x, y)
    .setFont(undefined, 'normal');
  doc.text(moment(selectedDate).format('DD-MM-YYYY') || '', x + 30, y);
  //Timezone text
  y += 15;
  doc
    .setFont(undefined, 'bold')
    .text('Timezone:-', x, y)
    .setFont(undefined, 'normal');
  doc.text(timezone?.timezone || '', x + 55, y);

  y += 15;
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
  x = 15;
  y += 20;
  const roomHieght = 170;
  const roomWidth = 116;
  const slotLength = 6;
  (roomData || []).forEach((room) => {
    let slotData = new Array(slotLength).fill(false);
    (room.slots || []).forEach((slot, index) => {
      slotData[index] = slot;
    });
    for (let i = 0; i < slotData.length; i++) {
      if (i % slotLength === 0) {
        giveRoomSlot(
          doc,
          room?.studioRoom,
          x,
          y,
          roomWidth,
          roomHieght,
          slotData.slice(0, slotLength),
          showEquipment,
        );
        slotData.splice(0, slotLength);
        y += roomHieght;
        if (y >= height - roomHieght) {
          doc.insertPage();
          y = 20;
          x = 15;
        }
      }
    }
    const remainingslotData = new Array(slotLength).fill(false);
    (slotData || []).forEach((slot, index) => {
      remainingslotData[index] = slot;
    });
    if (slotData.length > 0) {
      giveRoomSlot(
        doc,
        room?.studioRoom,
        x,
        y,
        roomWidth,
        roomHieght,
        remainingslotData,
      );
      y += roomHieght;
      if (y >= height - roomHieght) {
        doc.insertPage();
        y = 20;
        x = 15;
      }
    }
  });

  //service sections
  if (roomData.length > 0) {
  // doc.setFontSize(subHeadingFontSize);
    (roomData || []).forEach((room) => {
      let slotData = [];
      (room.slots || []).forEach((slot, index) => {
        slotData[index] = slot;
      });
      (slotData || []).forEach((section, index) => {
        if (
          (section.type === 'Audition' || section.type === 'Session') &&
          (section?.talentSchedule || []).length
        ) {
          doc
          .setFont(undefined, 'bold')
          .text('Talent Schedule', x + 28, y + 20)
          .setFont(undefined, 'normal');
          let head = ['Time', 'Talent', `Agency`, 'Character', 'Duration'];
          const body = [];
          (section?.talentSchedule || []).forEach((s) => {
            const startTime = moment(s.startTime, ['HH:mm']).format('hh:mm A');
            const endTime = moment(s.endTime, ['HH:mm']).format('hh:mm A');
            const timeRange = `${startTime} - ${endTime}`;
            body.push([
              timeRange,
              s.talentName,
              s.agent,
              s.character,
              s.duration,
            ]);
          });
          const remainingHeight = height - y;
          const currentSectionHeight =
            ((section?.talentSchedule || []).length + 1) * 20 + 100;
          if (currentSectionHeight > remainingHeight) {
            doc.insertPage();
            y = 30;
          }
          const subHeadingFontSize = 10;
          const {currentY} = getOneSection(
            x,
            y,
            doc,
            width,
            head,
            body,
            headingFontSize,
            subHeadingFontSize,
            section,
            room,
          );
          y = currentY;
          if (y >= height) {
            y = y - height;
          }
        }
      });
    });
  }

  doc.save(`Calendar_${Date.now()}.pdf`);
  return true;
};
