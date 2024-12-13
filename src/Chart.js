// DONE -----------split rate of return before and after retirement
// DONE -----------show  adjusted retirement income for inflation under today's dollars
// DONE -----------make inflationa slider
// DONE -----------show change in post retirement income from  inflation when moving chart
// PARTLY DONE -- need to adjust monthly contributions calculations -------------anticipated inherittace feature
// DONE ------------Larger thicker graph lines, perhaps a coloured background?
// Existing pac for comparison
// PAC needs to auto update as we move inflation or ror
// DONE ------------Bottom line should range from 18 to 99 and fixed
// DONE ------------Title on top FIN#
// DONE ------------All figures need comas. $1,234,000 not 1234000
// DONE ------------What is the future balance at date of departure? The graph should end there not at 0
// CONFLICTING WITH PREVIOUS --- Value son left side need to remain constant not change with calculations
// DONE ------------Make everything fit on one page. No need to scroll the page up and down
// DONE ------------Does the monthly retirement income factor in inflation?

import Chart from 'chart.js/auto';
import React, { useState, useEffect} from 'react';
import { Line } from 'react-chartjs-2';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { FaPlus, FaMinus } from 'react-icons/fa';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import ChartAnnotation from 'chartjs-plugin-annotation';
import { Range } from 'react-range';
import './investometer.css';
Chart.register(
  ChartDataLabels,
  ChartAnnotation
);

const RealTimeGraph = () => {



  let isEnough = false; // If the FIN is high enough to support lifestyle without going broke
  const [postInterestRateValue, setPostInterestRateValue] = useState(5); // Initial intrest rate value
  const [preInterestRateValue, setPreInterestRateValue] = useState(5); // Initial intrest rate value
  const [averageInflationValue, setAverageInflationValue] = useState(2); // Initial intrest rate value
  const [ageValue, setAgeValue] = useState(18); // Initial age value
  const [retirementAgeValue, setRetirementAgeValue] = useState(65); // Initial retirement age value
  const [deathAgeValue, setDeathAgeValue] = useState(85); // Initial retirement age value
  const [initialInvestmentValue, setInitialInvestmentValue] = useState(100000); // Initial Investment value
  const [monthlyContibutionsValue, setMonthlyContributionsValue] = useState(0); // Initial Investment value
  const [retirementSalaryValue, setRetirementSalaryValue] = useState(2000); // monthlybudget after retirement
  const [isCollapsed, setIsCollapsed] = useState(true); // State to track if inheritance collapsed
  const [anticipatedInheritanceValue, setAnticipatedInheritanceValue] = useState(0); // Inheritance value 
  const [inheritanceAgeValue, setInheritanceAgeValue] = useState(0); // Inheritance Age
  const [ageValues, setageValues] = useState([18, 65, 85]); // low, middle, high values
  
  const FormatCurrency = ({ value }) => {
    const formattedValue = new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(value);
  
    return formattedValue;
  };

  const handleChange = (ageValues) => {
    setageValues(ageValues); // Update the state when slider handles move
    setAgeValue(ageValues[0]);
    setRetirementAgeValue(ageValues[1]);
    setDeathAgeValue(ageValues[2]);
};

  function calculateMonthlyContribution(
    initialInvestment,
    preInterestRate,
    postInterestRate,
    inflationRate,
    currentAge,
    retirementAge,
    ageOfDeparture,
    monthlyWithdrawal
  ) {
    const yearsUntilRetirement = (retirementAge - currentAge);
    const withdrawalDuration = (ageOfDeparture - retirementAge);
    const yearlyWithdrawl = monthlyWithdrawal * 12

    // Convert rates to decimals
    const preAnnualInterestRate = preInterestRate / 100;
    const postAnnualInterestRate = postInterestRate / 100;
    const actualAnnualInflationRate = inflationRate / 100;


    // Future value of initial investment at retirement
    const futureValueAtRetirement = initialInvestment * Math.pow(1 + preAnnualInterestRate, yearsUntilRetirement);
    const adjustedFutureValue = futureValueAtRetirement / Math.pow(1 + actualAnnualInflationRate, yearsUntilRetirement);

    // Adjusted withdrawal amount considering inflation
    const adjustedWithdrawal = yearlyWithdrawl * Math.pow(1 + actualAnnualInflationRate, yearsUntilRetirement);

    // Amount still needed after accounting for future value of initial investment
    const presentValueWithInterest = adjustedWithdrawal * (1 - Math.pow(1 + postAnnualInterestRate, -withdrawalDuration)) / postAnnualInterestRate;
    // Calculate the remaining amount needed
    const remainingAmount = presentValueWithInterest - adjustedFutureValue;

    // Monthly interest rate and total number of payments
    const monthlyInterestRate = preAnnualInterestRate / 12;
    const totalPayments = yearsUntilRetirement * 12;

    // Calculate the monthly investment needed
    const adjustedAmount = remainingAmount * Math.pow(1 + actualAnnualInflationRate, yearsUntilRetirement);
    const monthlyInvestment = (adjustedAmount * monthlyInterestRate) / (Math.pow(1 + monthlyInterestRate, totalPayments) - 1);


    setMonthlyContributionsValue(monthlyInvestment > 0 ? monthlyInvestment.toFixed(2) : 0); // Ensure no negative contributions
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    calculateMonthlyContribution(
      initialInvestmentValue,
      preInterestRateValue,
      postInterestRateValue,
      averageInflationValue,
      ageValue,
      retirementAgeValue,
      deathAgeValue,
      retirementSalaryValue
    );
  };


  function calculateCompoundInterest(initialInvestment, annualInterestRate, years, monthlyContribution, inflationValue, age) {

    if(years  +  age <  inheritanceAgeValue || inheritanceAgeValue < age){
        // Step 1: Calculate the future value of the initial investment
        const futureValueInitial = initialInvestment * Math.pow(1 + annualInterestRate / 100, years);

        // Step 2: Calculate the future value of the monthly contributions
        const monthlyRate = annualInterestRate / 100 / 12;
        const totalMonths = years * 12;

        const futureValueContributions = monthlyContribution * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);

        // Step 3: Calculate the total future value
        const totalFutureValue = futureValueInitial + futureValueContributions;

        // Step 4: Adjust for inflation
        let adjustedFutureValue = totalFutureValue / Math.pow(1 + inflationValue / 100, years);

        return adjustedFutureValue;
    }
    //after inheritance
    else{
        // Step 1: Calculate the future value of the initial investment
        const futureValueInitial = initialInvestment * Math.pow(1 + annualInterestRate / 100, inheritanceAgeValue-age);

        // Step 2: Calculate the future value of the monthly contributions
        const monthlyRate = annualInterestRate / 100 / 12;
        const totalMonths = years * 12;

        const futureValueContributions = monthlyContribution * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);

        // Step 3: Calculate the total future value
        const totalFutureValue = futureValueInitial + futureValueContributions;

        // Step 4: Adjust for inflation
        let adjustedFutureValue = totalFutureValue / Math.pow(1 + inflationValue / 100, inheritanceAgeValue-age);

        //do calculations again for after inheritance
        // Step 1: Calculate the future value of the initial investment plus inheritance
        const futureValueInitial2 = (adjustedFutureValue+anticipatedInheritanceValue) * Math.pow(1 + annualInterestRate / 100, (age+years)-inheritanceAgeValue);
        // Step 2: Calculate the future value of the monthly contributions
        const totalMonths2 = years * 12;

        const futureValueContributions2 = monthlyContribution * ((Math.pow(1 + monthlyRate, totalMonths2) - 1) / monthlyRate);
        // Step 3: Calculate the total future value
        const totalFutureValue2 = futureValueInitial2 + futureValueContributions2;

        // Step 4: Adjust for inflation
        let adjustedFutureValue2 = totalFutureValue2 / Math.pow(1 + inflationValue / 100, (age+years)-inheritanceAgeValue);
        return adjustedFutureValue2;
    }
  }

  function calculateCompoundInterestAfterRetirement(annualInterestRate, YearsBeforeRetirement, previousInvestment, annualInflationRate, monthlyWithdrawal) {

    // Convert annual rates to decimals
    const r = annualInterestRate / 100;  // Convert to decimal
    const i = annualInflationRate / 100; // Convert to decimal

    // Calculate the adjusted monthly withdrawal amount
    const adjustedWithdrawals = monthlyWithdrawal * Math.pow(1 + i, YearsBeforeRetirement);

    // Calculate the total amount after interest for the year
    const totalAfterInterest = previousInvestment * (1 + r);

    // Total withdrawals for the year
    const totalWithdrawals = adjustedWithdrawals * 12; // 12 months

    // Calculate the amount left at the end of the year
    const amountLeft = totalAfterInterest - totalWithdrawals;


    if (amountLeft < 0) {
      isEnough = false;
      return previousInvestment - totalWithdrawals;
    }
    else {
      isEnough = true;
      return amountLeft;
    }
  }

  const generateData = (count, initialInvestment, age, retirementAge, postInterestRate, preInterestRate, monthlyContibutions, inflation, monthlybudget) => {

    const data = [];
    for (let i = 0; i <= count; i++) {
      if (i > (retirementAge - age)) {
        data.push(calculateCompoundInterestAfterRetirement(postInterestRate, (retirementAge - age), data[i - 1], inflation, monthlybudget));
        continue;
      }
      data.push(calculateCompoundInterest(initialInvestment, preInterestRate, i, monthlyContibutions, inflation, age));
    }
    return data;
  };

  // Generate initial data
  const getData = generateData(deathAgeValue - ageValue, initialInvestmentValue, ageValue, retirementAgeValue, postInterestRateValue, preInterestRateValue, monthlyContibutionsValue, averageInflationValue, retirementSalaryValue);

  // Chart data and options
  const [chartData, setChartData] = useState({
    labels: Array.from({ length: deathAgeValue + 1 - ageValue }, (_, i) => i + ageValue),
    datasets: [
      {
        label: 'Total Growth',
        fill: false,
        lineTension: 0.1,
        color:'29A3FF',
        borderColor: '#29A3FF',
        borderWidth: 10,
        borderCapStyle: 'round',
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: 'miter',
        pointBorderColor: '#E61313',
        pointBackgroundColor: '#29A3FF',
        pointBorderWidth: 3,
        pointHoverRadius: 20,
        pointHoverBackgroundColor: '#E61313',
        pointHoverBorderColor: '#29A3FF',
        pointHoverBorderWidth: 2,
        pointRadius: 2,
        pointHitRadius: 10,
        data: getData,
      },
    ],
  });

  useEffect(() => {
    setChartData({
      labels: Array.from({ length: deathAgeValue + 1 - ageValue }, (_, i) => i + ageValue),
      datasets: [
        {
          label: 'Total Growth',
          fill: false,
          lineTension: 0.1,
          color:'BC8F8F',
          borderColor: '#29A3FF',
          borderWidth: 10,
          borderCapStyle: 'round',
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: 'miter',
          pointBorderColor: '#8B4513',
          pointBackgroundColor: '#BC8F8F',
          pointBorderWidth: 2,
          pointHoverRadius: 10,
          pointHoverBackgroundColor: '#E61313',
          pointHoverBorderColor: '#29A3FF',
          pointHoverBorderWidth: 2,
          pointRadius: 1,
          pointHitRadius: 10,
          data: getData,
        },
      ],
    })
  }, [ageValue, retirementAgeValue, deathAgeValue, initialInvestmentValue, preInterestRateValue, postInterestRateValue, retirementSalaryValue, averageInflationValue, monthlyContibutionsValue, anticipatedInheritanceValue, inheritanceAgeValue]);

  const calculateFutureValue = () => {
    const futureValue = retirementSalaryValue * Math.pow(1 + averageInflationValue/100, retirementAgeValue-ageValue) 
    return futureValue;
};
const toggleCollapse = () => {
    if (!isCollapsed){
        setAnticipatedInheritanceValue('');
        setInheritanceAgeValue('');
    }
    setIsCollapsed(!isCollapsed); // Toggle collapse state  for inheritance bubble

}
  return (
    <Container className="mt-5">
    <Row className="mb-4">
        <Col>
            <h2 className="text-center">FIN#</h2>
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="form" className="p-4 border rounded shadow-sm bg-light">
                <div style={{
            position: 'absolute',
            top: '3%', 
            right: '15%', 
            background: '#f8f9fa', 
            padding: '5px', 
            borderRadius: '8px', 
            boxShadow: '0 0 10px rgba(0,0,0,0.2)',
            width: '200px',
            zIndex: 100,
            transition: 'all 0.3s ease',
        }}>
            <div 
                style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                onClick={toggleCollapse}
            >
                <div style={{ marginRight: '10px' }}>
                    {isCollapsed ? <FaPlus /> : <FaMinus />}
                </div>
                <h5 className="text-center mb-0" style={{ fontSize: '0.7rem' }}>
                    Anticipated Inheritance
                </h5>
            </div>
            {!isCollapsed && (
                <>
                    <Row className="mb-3">
                        <Form.Label>Value of Inheritance:</Form.Label>
                        <Col>
                            <Form.Control
                                type="number"
                                value={anticipatedInheritanceValue}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setAnticipatedInheritanceValue(value === '' ? '' : Number(value));
                                }}
                                required
                                className="fun-input"
                            />
                        </Col>
                    </Row>
                    <Row className="mb-3">
                        <Form.Label>Age of Inheritance:</Form.Label>
                        <Col>
                            <Form.Control
                                type="number"
                                value={inheritanceAgeValue}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setInheritanceAgeValue(value === '' ? '' : Number(value));
                                }}
                                required
                                className="fun-input"
                            />
                        </Col>
                    </Row>
                </>
            )}
        </div>
                    <Row className="mb-3">
                        <Form.Label>Value of Current Retirement Investment:</Form.Label>
                        <Col>
                            <Form.Control
                                type="number"
                                value={initialInvestmentValue}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setInitialInvestmentValue(value === '' ? '' : Number(value));
                                }}
                                required
                                className="fun-input"
                            />
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Form.Label>Gross Monthly Retirement Income:</Form.Label>
                        <Col>
                            <Form.Control
                                type="number"
                                value={retirementSalaryValue}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setRetirementSalaryValue(value === '' ? '' : Number(value));
                                }}
                                required
                                className="fun-input"
                            />
                        </Col>
                        <Col>
                            <Form.Label>
                                Future Value: ${calculateFutureValue().toFixed(2)}
                            </Form.Label>
                        </Col>
                    </Row>
                    <Row className="mb-3">
                        <Col className="text-center">
                            <Button type="submit" variant="primary" className="fun-button">
                                Calculate Monthly Investment Needed
                            </Button>
                        </Col>
                    </Row>
                    <Row className="mb-3">
                        <Form.Label>Monthly Investment: </Form.Label>
                        <Col>
                            <Form.Control
                                type="number"
                                value={monthlyContibutionsValue}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setMonthlyContributionsValue(value === '' ? '' : Number(value));
                                }}
                                required
                                className="fun-input"
                            />
                        </Col>
                    </Row>
                </Form.Group>
            </Form>
        </Col>
    </Row>

    <Row className="mt-4">
        <Col style={{ width: '55%', margin: '0 auto', position: 'relative' }}>
            <Row className="mb-3">
                <Col md={6} style={{ position: 'relative', textAlign: 'left' }}>
                    <Form.Label>Inflation Rate:</Form.Label>
                    <Form.Control
                        type="range"
                        min="1"
                        max="10"
                        step="0.5"
                        value={averageInflationValue}
                        onChange={(e) => setAverageInflationValue(Number(e.target.value))}
                        className="fun-range"
                    />
                    <Form.Text className="text-muted">{averageInflationValue}</Form.Text>
                </Col>
                <Col md={6} style={{ position: 'relative', textAlign: 'right' }}>
                    <Form.Label>Pre-Retirement Average Rate of Return:</Form.Label>
                    <Form.Control
                        type="range"
                        min="1"
                        max="10"
                        value={preInterestRateValue}
                        onChange={(e) => setPreInterestRateValue(Number(e.target.value))}
                        className="fun-range"
                    />
                    <Form.Text className="text-muted">{preInterestRateValue}</Form.Text>
                </Col>
                <Col md={6} style={{ position: 'relative', textAlign: 'right' }}>
                    <Form.Label>Post-Retirement Average Rate of Return:</Form.Label>
                    <Form.Control
                        type="range"
                        min="1"
                        max="10"
                        value={postInterestRateValue}
                        onChange={(e) => setPostInterestRateValue(Number(e.target.value))}
                        className="fun-range"
                    />
                    <Form.Text className="text-muted">{postInterestRateValue}</Form.Text>
                </Col>
            </Row>
            <div style={{ backgroundColor: '#f0f0f0', margin: 'auto' }}>
            <Line
                data={chartData}
                options={{
                    scales: {
                        y: {
                            ticks: {
                                beginAtZero: true
                            },
                            grid: {
                                display: true, // Hide the grid lines for the y-axis
                            }
                        },
                        x:  {
                            type: 'linear',
                            min: 18,  // Starting value for x-axis
                            max: 100, // Ending value for x-axis
                            ticks: {
                                stepSize: 1,  // Interval for ticks (e.g., 0, 10, 20, ...)
                            },
                            grid: {
                                display: false,
                              },
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        },
                        datalabels: {
                            color: isEnough ? 'green' : 'red',
                            display: function (context) {
                                return (context.dataIndex === retirementAgeValue - ageValue);
                            },
                            anchor: 'end',
                            align: 'end',
                            formatter: (value) => {
                                const formattedValue = new Intl.NumberFormat('en-CA', {
                                  style: 'currency',
                                  currency: 'CAD',
                                }).format(value);
                            
                                return `FIN: ${formattedValue}`;
                              }
                        },
                        annotation: {
                            annotations: {
                              lineAtZero: {
                                type: 'line',  // Type of annotation (line)
                                xMin: 0,  // Position at x = 0
                                xMax: 0,  // End position at x = 0 (for vertical line)
                                borderColor: 'blue',  // Line color
                                borderWidth: 2,  // Line thickness
                                label: {
                                  content: 'Zero',  // Optional label at the line
                                  position: 'top',  // Label position
                                },
                              },
                            },
                        }
                    }
                }}
            />
            </div>
            <div className="slider-container" style={{marginLeft:'50px', marginRight:'33px'}}>
            
            <Range
                values={ageValues}
                step={1}
                min={18}
                max={100}
                onChange={handleChange}
                renderTrack={({ props, children }) => (
                    <div
                        {...props}
                        style={{
                            ...props.style,
                            height: '10px',
                            backgroundColor: '#ddd',
                            borderRadius: '5px',
                        }}
                    >
                        {children}
                    </div>
                )}
                renderThumb={({ index, props, value }) => (
                    <div
                        {...props}
                        style={{
                            ...props.style,
                            height: '20px',
                            width: '20px',
                            borderRadius: '50%',
                            backgroundColor: '#007bff',
                            boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.2)',
                        }}
                    >
                        {/* Display the value below each thumb */}
                        <div
                            style={{
                                position: 'absolute',
                                top: '25px',
                                left: '-10px', // Adjust based on the thumb size
                                fontSize: '14px',
                                color: '#007bff',
                                textAlign: 'center',
                                width: '40px',
                            }}
                        >
                            {value}
                        </div>
                    </div>
                )}
            />
        </div>

       </Col>
    </Row>
</Container>
  );
};

export default RealTimeGraph;