import {PieChart} from 'react-minimal-pie-chart';
import classNames from '../projectTabs.module.css';

const WipChart = ({chartData}) => {

  const isTrue = chartData.every(obj => obj.value === 0);

  const defaultLabelStyle = {
    fontSize: '0.75rem',
    fill: isTrue ? 'var(--color-primary-700)' : '#fff',
    transform: isTrue ? 'rotate(0deg)' : 'rotate(0deg)',
  };
  return (
    <>
      <div
        className="position-relative wip_chart_round"
        style={{width: '110px', height: '110px'}}
      >
        <PieChart
          data={chartData}
          text-anchor="start"
          radius={50}
          segmentsShift={2}
          label={({dataEntry}) => `${dataEntry.value}%`}
          labelStyle={{
            ...defaultLabelStyle,
          }}
          center={[50, 50]}
          lengthAngle={360}
          lineWidth={100}
          paddingAngle={0}
          startAngle={0}
          viewBoxSize={[100, 100]}
          labelPosition={58}
        />
        <div className={classNames['title_color_indication']}>
          {chartData.map((d) => {
            return (
              <p className="mb-2" key={d.title}>
                <span className="color_fill"></span>
                {d.title}
              </p>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default WipChart;
