import {render, screen, waitFor, within} from '@testing-library/react';
import TalentList from './talentList';
import characterTalentList from 'test-utils/msw_mocks/responseData/charaterTalentList';

describe('character talent list', () => {
  const data = characterTalentList.response.result;
  test('render as expected', async () => {
    render(<TalentList selectedMilestone={[1, 2]} />);
    await waitFor(() => {
      const loader = within(screen.getByTestId('data-section')).queryByRole(
        'progressbar',
      );
      expect(loader).toBeNull();
    });
    const table = screen.getByRole('table');
    const rows = within(table).getAllByRole('row');
    //checking headers are rendered properly
    const headerCells = within(rows[0]).getAllByRole('columnheader');
    expect(headerCells[0]).toHaveTextContent('Talent');
    expect(headerCells[1]).toHaveTextContent('Character');
    expect(headerCells[2]).toHaveTextContent('Status');
    data.forEach((item, index) => {
      const cells = within(rows[index + 1]).getAllByRole('cell');
      const img = within(cells[0]).getByRole('img');
      expect(img).toHaveAttribute(
        'src',
        `data:${item?.filename?.split('.')[1]};base64,` + item.image,
      );
      expect(cells[0]).toHaveTextContent(item?.talent || '--');
      expect(cells[1]).toHaveTextContent(item?.character || '--');
      expect(cells[2]).toHaveTextContent(item?.status || '--');
    });
  });
});
