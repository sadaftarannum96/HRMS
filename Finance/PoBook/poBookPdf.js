import jsPDF from 'jspdf';
import {getPoBookPdfData} from './getPoBookPdfData';
import SideLogo from '../../images/Side-images/Green/SidePdfLogo.png';
import moment from 'moment';
import {currencyName} from 'helpers/helpers';

const poBookMainHeading = (
  doc,
  width,
  height,
  headingFontSize,
  subHeadingFontSize,
  textGap,
  x,
  y,
  staticData,
) => {
  let X = x;
  let Y = y;
  X += 20;
  Y += 25;
  //side logo
  const imageWidth = 175;
  const imageHeight = 75;
  doc.addImage(
    SideLogo,
    'png',
    width / 2 + 40,
    staticData?.info ? Y + 5 : Y - 5,
    imageWidth,
    imageHeight,
  );
  doc.setFontSize(subHeadingFontSize);
  doc.text(staticData?.address?.line1 || '', X, Y);
  Y += textGap;
  doc.text(staticData?.address?.line2 || '', X, Y);
  Y += textGap;
  doc.text(staticData?.address?.line3 || '', X, Y);
  Y += textGap + 10;
  if (staticData?.phoneNumber?.number1) {
    doc.text(staticData?.phoneNumber?.number1 || '', X, Y);
    Y += textGap;
  }
  if (staticData?.phoneNumber?.number2) {
    doc.text(staticData?.phoneNumber?.number2 || '', X, Y);
    Y += textGap;
  }
  if (staticData?.side) {
    doc.text(staticData?.side || '', X, Y, {maxWidth: 100});
    Y += textGap;
  }
  if (staticData?.info) {
    doc.text(staticData?.info || '', X, Y, {maxWidth: 120});
    Y += 15;
  }
  //for line
  doc.setDrawColor('#212529');
  doc.setLineWidth(3);
  doc.line(15, Y, width - 15, Y);
  return {X, Y};
};

const pageChange = (
  doc,
  x,
  y,
  startingX,
  startingY,
  height,
  width,
  side,
  valueHeight,
) => {
  if (y + valueHeight >= height) {
    if (side === 'left') {
      return [
        startingX + width / 2 + 10,
        startingY,
        startingX,
        startingY,
        'right',
      ];
    } else if (side === 'right') {
      doc.insertPage();
      return [20, 20, 20, 20, 'left'];
    }
  } else {
    return [x, y, startingX, startingY, side];
  }
};
export const handlePrint = async (poBook) => {
  const {poData} = poBook;
  const currencySymbol = poData?.currency?.code
    ? currencyName(poData?.currency?.code) || poData?.currency?.code
    : '';
  const outStandingCosts = poData?.outStandingCosts?.replace(
    poData?.currency?.code,
    currencySymbol,
  );
  const poBookStaticData = getPoBookPdfData();
  const currentDate = moment().format('DD/MM/YYYY');
  const userDetails = JSON.parse(localStorage.getItem('userDetails'));
  const loggedInUserName = `${userDetails?.firstName} ${userDetails?.lastName}`;
  var doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    size: 'a4', //595 × 842 points
  });
  doc.setFontSize(10);
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  const headingFontSize = 12;
  const subHeadingFontSize = 10;
  const color = doc.getTextColor();
  let x = 0;
  let y = 0;
  const textGap = 15;
  const {X, Y} = poBookMainHeading(
    doc,
    width,
    height,
    headingFontSize,
    subHeadingFontSize,
    textGap,
    x,
    y,
    poBookStaticData,
  );
  x = X;
  y = Y + 20;
  const distanceX = 300;
  const valueDistanceX = 100;
  const maximumWidth = 150;
  doc.setFontSize(headingFontSize);
  doc
    .setFont(undefined, 'bold')
    .text('Purchase Order', x, y)
    .setFont(undefined, 'normal');
  doc.setFontSize(subHeadingFontSize);
  y += 20;
  doc
    .setFont(undefined, 'bold')
    .text('Project', x, y)
    .setFont(undefined, 'normal');
  doc.text(poData?.project || '', x + valueDistanceX, y, {
    maxWidth: maximumWidth,
  });
  doc
    .setFont(undefined, 'bold')
    .text('Supplier', x + distanceX, y)
    .setFont(undefined, 'normal');
  doc.text(poData?.supplier || '', x + distanceX + valueDistanceX, y, {
    maxWidth: maximumWidth,
  });
  const projectHieght = doc.getTextDimensions(poData?.project || '', {
    maxWidth: maximumWidth,
  })?.h;
  const supplierHieght = doc.getTextDimensions(poData?.supplier || '', {
    maxWidth: maximumWidth,
  })?.h;
  const extraHieght = Math.max(projectHieght, supplierHieght);
  y += 10 + extraHieght;
  doc
    .setFont(undefined, 'bold')
    .text('Requested By', x, y)
    .setFont(undefined, 'normal');
  doc.text(loggedInUserName || '', x + valueDistanceX, y, {
    maxWidth: maximumWidth,
  });
  doc
    .setFont(undefined, 'bold')
    .text('Requested Date', x + distanceX, y)
    .setFont(undefined, 'normal');
  doc.text(currentDate || '', x + distanceX + valueDistanceX, y);
  //order number
  y += 30;
  doc.setFontSize(headingFontSize);
  doc
    .setFont(undefined, 'bold')
    .text(`Order Number ${poData?.poNumber}`, x, y)
    .setFont(undefined, 'normal');
  //Order Details start
  y += 20;
  const sectionStartingY = y + 30;
  doc.setFillColor('#343a40');
  doc.roundedRect(x, y, width - x * 2, 25, 5, 0, 'F');
  doc.setFontSize(subHeadingFontSize);
  doc.setTextColor('#fff');
  doc.text('Order Details', x + 15, y + 15);
  doc.setTextColor(color);
  y += 50;
  x += 10;
  doc
    .setFont(undefined, 'bold')
    .text('One - Off Costs', x, y)
    .setFont(undefined, 'normal');
  const oneOffCost = poData?.oneOffCost
    ? `${currencySymbol} ${poData?.oneOffCost}`
    : '';
  const rates =
    poData?.rateUnit && poData?.rate
      ? `${poData?.rateUnit} ${poData?.rateType} @ ${currencySymbol} ${
          poData?.rate
        } = ${currencySymbol} ${poData?.rateUnit * poData?.rate}`
      : '';
  doc.text(oneOffCost || '', x + valueDistanceX, y);
  doc
    .setFont(undefined, 'bold')
    .text('Rates', x + distanceX - 10, y)
    .setFont(undefined, 'normal');
  doc.text(rates || '', x + distanceX + valueDistanceX - 30, y, {
    maxWidth: width - x * 2 - (distanceX + valueDistanceX - 30),
  });
  //buyout
  if (poData?.buyout?.length) {
    y += 20;
    x = 20;
    doc
      .setFont(undefined, 'bold')
      .text('Buyout', x + 10, y)
      .setFont(undefined, 'normal');
    poData?.buyout?.forEach((b, i) => {
      y += 20;
      const buyout = `${b.unit}     ${b?.category}     @     ${currencySymbol} ${b?.rate}     =     ${currencySymbol} ${b?.total}`;
      doc.text(buyout || '', x + 10, y);
    });
  }
  //details
  if (poData?.details) {
    const notesDistanceX = 40;
    y += 20;
    x += 10;
    doc
      .setFont(undefined, 'bold')
      .text('Notes', x, y)
      .setFont(undefined, 'normal');
    doc.text(poData?.details || '', x + notesDistanceX, y, {
      maxWidth: width - x - (x + notesDistanceX),
    });
    const notesHeight = doc.getTextDimensions(poData?.details || '', {
      maxWidth: width - x - (x + notesDistanceX),
    }).h;
    y += notesHeight - 10;
  }
  x = 20;
  const borderHeight = y - sectionStartingY + 10;
  doc.setLineWidth(1);
  doc.roundedRect(x, sectionStartingY, width - x * 2, borderHeight, 5, 5);
  //Order Details end

  //Total
  y += 20;
  doc.setFillColor('#343a40');
  doc.roundedRect(x, y, width - x * 2, 25, 5, 0, 'F');
  doc.setFontSize(subHeadingFontSize);
  doc.setTextColor('#fff');
  doc.text('Total (Ex. VAT): ', x + 15, y + 15);
  const totalWidth = doc.getTextDimensions(outStandingCosts || '')?.w + 10;
  doc.text(outStandingCosts || '', x + width - x * 2 - totalWidth, y + 15);
  //terms and conditions
  doc.setTextColor(color);
  y += 50;
  doc.text(poBookStaticData?.termAndConditions?.h1 || '', x, y, {
    maxWidth: width - x,
  });
  y += 20;
  doc.text(poBookStaticData?.termAndConditions?.h2 || '', x, y, {
    maxWidth: width - x,
  });
  //agreed terms
  y += 40;
  doc
    .setFont(undefined, 'bold')
    .text('Agreed terms', x, y)
    .setFont(undefined, 'normal');
  let sectionSide = 'left';
  let startingX = x;
  let startingY = y;
  let halfSectionWidth = width / 2;
  poBookStaticData?.termAndConditions?.['Agreed terms']?.forEach(
    (term, index) => {
      y += 20;
      doc
        .setFont(undefined, 'bold')
        .text(term?.mainHeading || '', x, y, {maxWidth: halfSectionWidth})
        .setFont(undefined, 'normal');
      const headingHeight = doc.getTextDimensions(
        term?.mainHeading || '',
        x,
        y,
        {maxWidth: halfSectionWidth},
      )?.h;
      y += headingHeight + 15;
      term?.points?.forEach((point, pointIndex) => {
        Object.values(point || {}).forEach((value) => {
          const valueHeight = doc.getTextDimensions(value || '', {
            maxWidth: halfSectionWidth,
          })?.h;
          const [X, Y, startX, startY, Side] = pageChange(
            doc,
            x,
            y,
            startingX,
            startingY,
            height,
            width,
            sectionSide,
            valueHeight,
          );
          sectionSide = Side;
          x = X;
          y = Y;
          startingX = startX;
          startingY = startY;
          if (sectionSide === 'left') {
            halfSectionWidth = width / 2 - x;
          } else {
            halfSectionWidth = width - x - 20;
          }
          doc.text(value || '', x, y, {maxWidth: halfSectionWidth});
          const h = doc.getTextDimensions(value || '', {
            maxWidth: halfSectionWidth,
          })?.h;
          const extraH = term?.points?.length === pointIndex + 1 ? 0 : 10;
          y += h + extraH;
        });
      });
    },
  );
  doc.save(`poBook-${poData?.project}-${poData?.poNumber}.pdf`);
  return true;
};
