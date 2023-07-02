import {render, within, screen, waitFor} from '@testing-library/react';
import moment from 'moment';
import Bulletin from './bulletin';
import ProfileS from '../images/svg/users-default.svg';
import bulletinData from '../test-utils/msw_mocks/responseData/bulletin';
import userEvent from '@testing-library/user-event';
import {downloadPdf} from 'apis/s3.api';
import Pdf from '../images/svg/layer1.svg';

jest.mock('apis/s3.api', () => {
  return {
    ...jest.requireActual('apis/s3.api'),
    downloadPdf: jest.fn(),
  };
});

describe('bulletin component', () => {
  window.URL.createObjectURL = jest.fn();
  beforeEach(() => {
    downloadPdf.mockImplementation(async (data) => {
      return Promise.resolve({message: 'Document downloaded Successfully'});
    });
  });
  afterEach(() => {
    window.URL.createObjectURL.mockReset();
    jest.clearAllMocks();
  });
  const data = bulletinData.response.result;
  test('should render bulletin data', async () => {
    render(<Bulletin bulletinList={data} loadingBulletin={false} />);
    const time = moment(data[0]?.publishTime, ['HH:mm']).format('h:mm A');
    const yesterdayDate = moment().subtract(1, 'days').format('YYYY-MM-DD');
    const currentDate = moment(new Date()).format('YYYY-MM-DD');
    const dataSection = screen.getByTestId('data-section');
    expect(dataSection).toBeInTheDocument();
    const oneSection = within(dataSection).getByRole(data[0]?.id);
    expect(oneSection).toBeInTheDocument();
    const imgDiv = within(oneSection).getByTestId(`userProfile-${data[0]?.id}`);
    const imgSrc = within(imgDiv).getByRole('img');
    expect(imgSrc).toHaveAttribute('src', ProfileS);
    const createdByName = within(oneSection).getByText(data[0]?.createdByName);
    expect(createdByName).toBeInTheDocument();
    if (time) {
      const timeEle = within(oneSection).getByText(time);
      expect(timeEle).toBeInTheDocument();
    }
    if (data[0]?.publishDate) {
      const dayType =
        yesterdayDate === data[0]?.publishDate
          ? 'yesterday'
          : currentDate === data[0]?.publishDate
          ? 'today'
          : data[0]?.publishDate;
      const day = within(oneSection).getByText(`, ${dayType}`);
      expect(day).toBeInTheDocument();
    }
    (data[0]?.studios).forEach((d, ind) => {
      const day = within(oneSection).getByText(
        `${ind === 0 ? '' : ', '}${d.name}`,
      );
      expect(day).toBeInTheDocument();
    });
    for (let doc of data[0]?.bulletinDocs) {
      const validImage =
        doc?.filename?.split('.')[1] === 'png' ||
        doc?.filename?.split('.')[1] === 'jpeg' ||
        doc?.filename?.split('.')[1] === 'jpg';
      if (validImage) {
        const docImageDiv = within(oneSection).getByTestId(
          `docImage-${doc.id}`,
        );
        const imgSrc = within(docImageDiv).getByRole('img');
        expect(imgSrc).toHaveAttribute(
          'src',
          `data:${doc?.filename?.split('.')[1]};base64,` + doc.image,
        );
        userEvent.click(imgSrc);
        await waitFor(() => {
          expect(downloadPdf).toHaveBeenCalled();
        });
      }
    }
    if ((data[0]?.bulletinDocs || []).length > 0) {
      const notes = within(oneSection).getByText(data[0]?.notes);
      expect(notes).toBeInTheDocument();
    }
    for (let doc of data[0]?.bulletinDocs) {
      const validImage =
        doc?.filename?.split('.')[1] === 'png' ||
        doc?.filename?.split('.')[1] === 'jpeg' ||
        doc?.filename?.split('.')[1] === 'jpg';
      if (!validImage) {
        const pdfImageDiv = within(oneSection).getByTestId(
          `pdfImage-${doc.id}`,
        );
        const imgSrc = within(pdfImageDiv).getByRole('img');
        expect(imgSrc).toHaveAttribute('src', Pdf);
        userEvent.click(imgSrc);
        await waitFor(() => {
          expect(downloadPdf).toHaveBeenCalled();
        });
      }
    }
  });
});
