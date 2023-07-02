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

const getOneTalent = ({
  X,
  y,
  talent,
  doc,
  subHeadingFontSize,
  borderStartPoint,
  borderEndPoint,
  index,
  extraY,
  updatedX,
  x,
  arr,
  extraYSum,
  initialStartingX,
  initialY,
  allSlotTalents,
}) => {
  let backgroundColorHieght = extraY;
  const roleHieght = doc.getTextDimensions(talent?.character || '', {
    maxWidth: 35,
  })?.h;
  const talentHieght = doc.getTextDimensions(talent?.talent || '', {
    maxWidth: 40,
  })?.h;
  const height = Math.max(roleHieght, talentHieght);
  extraY = Math.max(extraY, height);
  if (extraY > 35) {
    extraY = extraY - 35 + 25; //here 25 is margin top from text
    backgroundColorHieght = extraY - 35 + 25; //here 25 is margin top from text
  } else {
    extraY = 0;
    backgroundColorHieght = 0;
  }
  updatedX += borderEndPoint / 2;
  if (index % 2 !== 0) {
    updatedX = x + initialStartingX;
    if (arr?.[index + 1]) {
      extraYSum += extraY + 35;
    } else {
      extraYSum += extraY;
    }
    extraY = 0;
  }
  doc.setFillColor(
    getBackgroundColor(talent?.sessionTalentStatus?.[0]?.status || ''),
  );
  const borderColorWidth =
  (allSlotTalents || []).length === 1 ||
  (index % 2 === 0 && allSlotTalents.length - 1 === index)
  ? borderEndPoint
  : borderEndPoint / 2;
  doc.setDrawColor(219, 219, 219);
  doc.roundedRect(
    x + borderStartPoint + (index % 2 !== 0 ? borderEndPoint / 2 : 0), //x
    initialY - 15 + (index >= 2 ? extraYSum : 0), //y
    borderColorWidth, //width
    35 + backgroundColorHieght, //height
    6,
    6,
    'FD',
  );
  const src = talent?.profileFilepath
    ? `data:${talent?.profileFilename?.split('.')[1]};base64,` + talent?.image
    : ProfilePng;
  const imgType = talent?.profileFilepath
    ? talent?.profileFilename?.split('.')[1]
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
  doc.text(talent?.talent || '', X, y + 5, {maxWidth: 40});
  const w = doc.getTextDimensions(talent?.talent || '', {maxWidth: 40})?.w + 8;
  //vertical line
  X += w || 50;
  doc.setDrawColor('black');
  doc.line(X, y - 5, X, y + 10);

  X += 8;
  doc.setFontSize(subHeadingFontSize);
  doc
    .setFont(undefined, 'bold')
    .text('Role:', X, y + 5)
    .setFont(undefined, 'normal');
  X += 25;
  doc.setFontSize(subHeadingFontSize);
  doc.text(talent?.character || '', X, y + 5, {maxWidth: 35});

  //vertical line
  const roleWidth =
    doc.getTextDimensions(talent?.character || '', {maxWidth: 35})?.w + 8;
  X += roleWidth || 50;
  doc.setDrawColor('black');
  doc.line(X, y - 5, X, y + 10);

  X += 8;
  doc.setFontSize(subHeadingFontSize);
  doc
    .setFont(undefined, 'bold')
    .text('Status:', X, y + 5)
    .setFont(undefined, 'normal');
  X += 30;
  doc.setFontSize(subHeadingFontSize);
  doc.text(talent?.sessionTalentStatus?.[0]?.status || '', X, y + 5, {
    maxWidth: 40,
  });

  return height;
};

const getOneSlots = (x, y, doc, item, headingFontSize, subHeadingFontSize) => {
  const borderStartPoint = 55;
  const borderEndPoint = 525;
  let extraY = 0;
  let extraYSum = 0;
  doc.setFontSize(subHeadingFontSize);
  doc.text(item?.slotTimings, x, y + 3);

  if (item?.isBreak) {
    doc.setFillColor('#2b2b2b');
    doc.roundedRect(
      x + borderStartPoint,
      y - 15,
      borderEndPoint,
      35,
      8,
      8,
      'F',
    );
    doc.setTextColor('#ffffff');
    doc.setFontSize(subHeadingFontSize);
    doc
      .setFont(undefined, 'bold')
      .text('Break', x + 300, y + 5)
      .setFont(undefined, 'normal');
    doc.setTextColor('#000000');
  } else if (!item?.slotTalents?.length) {
    doc.setFillColor('#c6eb6e');
    doc.roundedRect(
      x + borderStartPoint,
      y - 15,
      borderEndPoint,
      35,
      8,
      8,
      'F',
    );
    doc.setFontSize(subHeadingFontSize);
    doc
      .setFont(undefined, 'bold')
      .text('Booking :', x + 80, y + 5)
      .setFont(undefined, 'normal');
    doc.setFontSize(subHeadingFontSize);
    doc.text('Available', x + 125, y + 5);
  } else {
    const initialStartingX = 60;
    const initialY = y;
    let X = x;
    X += initialStartingX;
    item?.slotTalents?.forEach((talent, index, arr) => {
      const hieght = getOneTalent({
        X,
        y,
        talent,
        doc,
        subHeadingFontSize,
        borderStartPoint,
        borderEndPoint,
        index,
        extraY,
        updatedX: X,
        x,
        arr,
        extraYSum,
        initialStartingX,
        initialY,
        allSlotTalents: item?.slotTalents,
      });
      extraY = Math.max(extraY, hieght);
      if (extraY > 35) {
        extraY = extraY - 35 + 25; //here 25 is margin top from text
      } else {
        extraY = 0;
      }
      X += borderEndPoint / 2;
      if (index % 2 !== 0) {
        X = x + initialStartingX;
        if (arr?.[index + 1]) {
          extraYSum += extraY + 35;
        } else {
          extraYSum += extraY;
        }
        y += 35 + extraY;
        extraY = 0;
      }
    });
    //box for slot
    doc.setDrawColor(219, 219, 219);
    doc.roundedRect(
      x + borderStartPoint,
      initialY - 15,
      borderEndPoint,
      35 + extraYSum + extraY,
      8,
      8,
    );
  }
  return extraYSum + extraY;
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
  let x = 12.5;
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
  doc.save(`Session_Calendar_${Date.now()}.pdf`);
  return true;
};
