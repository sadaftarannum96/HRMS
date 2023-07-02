import jsPDF from 'jspdf';
import moment from 'moment';
import ProfilePng from '../../../images/svg/users-defaultPng.png';

const getBackgroundColor = (statusName) => {
  const statusObj = {
    Checking: '#fff',
    Penciled: '#FFFF00',
    Confirmed: '#00FF00',
  };
  return statusObj[statusName] || '#fff';
};
const getOneSlots = (x, y, doc, item, headingFontSize, subHeadingFontSize) => {
  const roleHieght = doc.getTextDimensions(item?.character?.name || '', {
    maxWidth: 60,
  })?.h;
  const talentHieght = doc.getTextDimensions(item?.talent || '', {
    maxWidth: 300,
  })?.h;
  let extraY = Math.max(roleHieght, talentHieght);
  if (extraY > 35) {
    extraY = extraY - 35;
  } else {
    extraY = 0;
  }
  doc.setFontSize(subHeadingFontSize);
  doc.text(item?.slotTimings, x, y + 3);
  if (item?.isBreak) {
    doc.setFillColor('#2b2b2b');
    doc.roundedRect(x + 75, y - 15, 470, 35, 8, 8, 'F');
  } else if (item?.talentShortlistId === null) {
    doc.setFillColor('#c6eb6e');
    doc.roundedRect(x + 75, y - 15, 470, 35, 8, 8, 'F');
  } else {
    item?.status?.[0]?.status &&
      doc.setFillColor(getBackgroundColor(item?.status?.[0]?.status));
    doc.setDrawColor(219, 219, 219);
    doc.roundedRect(
      x + 75,
      y - 15,
      470,
      35 + extraY,
      8,
      8,
      item?.status?.[0]?.status && item?.status?.[0]?.status !== 'Checking'  ? 'F' : 'S',
    );
  }

  if (item?.isBreak) {
    doc.setTextColor('#ffffff');
    doc.setFontSize(subHeadingFontSize);
    doc
      .setFont(undefined, 'bold')
      .text('Break', x + 300, y + 5)
      .setFont(undefined, 'normal');
    doc.setTextColor('#000000');
  } else if (item?.talentShortlistId === null) {
    doc.setFontSize(subHeadingFontSize);
    doc
      .setFont(undefined, 'bold')
      .text('Booking :', x + 85, y + 5)
      .setFont(undefined, 'normal');
    doc.setFontSize(subHeadingFontSize);
    doc.text('Available', x + 130, y + 5);
  } else {
    let X = x;
    // X += 90;
    // doc.addImage(DragDotsPng, 'png', X, y - 4.5, 6, 9);
    X += 82;

    const src = item?.profileFilepath
      ? `data:${item?.profileFilename?.split('.')[1]};base64,` + item?.image
      : ProfilePng;
    const imgType = item?.profileFilepath
      ? item?.profileFilename?.split('.')[1]
      : 'png';
    doc.addImage(src, imgType, X + 2.5, y - 6.5, 19, 19);
    const drawColor = doc.getDrawColor();
    doc.setDrawColor('#FFFFFF');
    doc.setLineWidth(4);
    doc.circle(X + 12, y + 3, 12); //circle for rounded profile image
    doc.setLineWidth(1);
    doc.setDrawColor(drawColor);

    doc.setFontSize(subHeadingFontSize);
    X += 30;
    doc
      .setFont(undefined, 'bold')
      .text('Name:', X, y + 5)
      .setFont(undefined, 'normal');
    doc.setFontSize(subHeadingFontSize);
    X += 30;
    doc.text(item?.talent || '', X, y + 5, {maxWidth: 300});
    const w =
      doc.getTextDimensions(item?.talent || '', {maxWidth: 300})?.w + 10;
    //vertical line
    X += w || 50;
    doc.line(X, y - 5, X, y + 10);

    X += 10;
    doc.setFontSize(subHeadingFontSize);
    doc
      .setFont(undefined, 'bold')
      .text('Role:', X, y + 5)
      .setFont(undefined, 'normal');
    X += 25;
    doc.setFontSize(subHeadingFontSize);
    doc.text(item?.character?.name || '', X, y + 5, {maxWidth: 60});

    //vertical line
    const roleWidth =
      doc.getTextDimensions(item?.character?.name, {
        maxWidth: 60,
      })?.w + 10;
    X += roleWidth || 50;
    doc.line(X, y - 5, X, y + 10);
    X += 10;
    doc.setFontSize(subHeadingFontSize);
    doc
      .setFont(undefined, 'bold')
      .text('Status:', X, y + 5)
      .setFont(undefined, 'normal');
    X += 30;
    doc.setFontSize(subHeadingFontSize);
    doc.text(item?.status?.[0]?.status || '', X, y + 5, {maxWidth: 60});
  }
  return extraY;
};

export const handlePrint = async (timeSlots) => {
  var doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    size: 'a4', //595 × 842 points
  });
  doc.canvas.width = '100px';

  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  const headingFontSize = 10;
  const subHeadingFontSize = 8;
  let y = 10;
  let x = 25;
  doc.setTextColor('#000000');
  doc.setFontSize(14);
  y += 20;
  doc
    .setFont(undefined, 'bold')
    .text('Venue:', width / 2 - 40, y)
    .setFont(undefined, 'normal');
  doc.text(`${(timeSlots || [])[0]?.studioRoom}`, width / 2 + 10, y);
  doc.setFontSize(headingFontSize);
  y += 20;
  doc
    .setFont(undefined, 'bold')
    .text('All Day', x, y)
    .setFont(undefined, 'normal');
  doc
    .setFont(undefined, 'bold')
    .text(
      `${moment(((timeSlots || [])[0] || []).auditionedOn).format(
        'DD MMM YYYY',
      )}`,
      x + 75,
      y,
    )
    .setFont(undefined, 'normal');
  y += 30;
  for (const item of timeSlots) {
    const extraY = getOneSlots(
      x,
      y,
      doc,
      item,
      headingFontSize,
      subHeadingFontSize,
    );
    y += 40 + extraY;
    if (y >= height - 50) {
      y = 50;
      doc.insertPage();
    }
  }
  doc.save(`Audition_Calendar_${Date.now()}.pdf`);
  return true;
};
