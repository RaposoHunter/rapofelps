import React, {useEffect, useState} from 'react';
import { View, StyleSheet, Dimensions, Text} from 'react-native';
import Svg, { Circle, Rect, Text as TextSVG } from 'react-native-svg';

import {
	LineChart,
	BarChart,
	PieChart,
	ProgressChart,
	ContributionGraph,
	StackedBarChart,
} from "react-native-chart-kit";
import { LineChartProps } from 'react-native-chart-kit/dist/line-chart/LineChart';

interface Reading {
    id: string,
    umidade: string,
    temperatura: string,
    co2: string,
    lido_em: string
}

interface LiceGraphProps {
    graphValues: Array<Reading>;
}

export function LineGraph() {
    /*
        EXIBIR AS 6 ULTIMAS LEITURAS (EQUIVALENTE A 1H DE LEITURAS)
        
        POSSIBILITAR VER O RELATÓRIO DO DIA, SEMANA, MÊS E ANO
    */

    // console.log(graphValues);


    let [timer, setTimer] = useState(0);

    let temperaturesT = new Array<number>();
    let humiditiesT = new Array<number>();
    let co2sT = new Array<number>();
    let idsT = new Array<string>();
    let datesT = new Array<string>();

    let [temperatures, setTemperatures] = useState(new Array<number>());
    let [humidities, setHumidities] = useState(new Array<number>());
    let [co2s, setCo2s] = useState(new Array<number>());
    let [ids, setIds] = useState(new Array<string>());
    let [dates, setDates] = useState(new Array<string>());
    let [tooltip, setTooltip] = useState({
         x:0, y:0, visible:false, value:0 
    });

    // function formatDate(date: string) { 
    //     let data = new Date(date);

    //     return `${data.getDate()}/${data.getMonth()}/${data.getFullYear()}`;
    // } 

    // useEffect(() => {
    //     for(let reading of graphValues) {
    //         temperaturesT.push(parseFloat(reading.temperatura));
    //         humiditiesT.push(parseFloat(reading.umidade));
    //         co2sT.push(parseFloat(reading.co2));
    //         idsT.push(reading.id);
    //     }

    //     setTemperatures(temperaturesT);
    //     setHumidities(humiditiesT);
    //     setCo2s(co2sT);
    //     setIds(idsT);
    // }, []);

    return (
		<View>
            <Text onPress={()=>{ console.log("I can be clicked!") }}>Bezier Line Chart</Text>
            <LineChart
            data={{
                // labels: ids,
                labels: ["0","1","3","4","7"],
                datasets: [
                    {
                        // data: temperatures,
                        data: [1,2,3,4,5],
                    },
                ]
            }}
            width={Dimensions.get("window").width} // from react-native
            height={220}
            yAxisLabel=""
            yAxisSuffix="°C"
            decorator={() => tooltip.visible ?
                <View>
                    <Svg>
                    <Rect x={tooltip.x - 20} y={tooltip.y + 10} width="40" height="30" fill="black" />
                    <TextSVG
                        x={tooltip.x}
                        y={tooltip.y + 30}
                        fill="white"
                        fontSize="16"
                        fontWeight="bold"
                        textAnchor="middle"
                    >
                        {tooltip.value}
                    </TextSVG>
                    </Svg>
                </View> : null
            }
            onDataPointClick={(data) => {
                // check if we have clicked on the same point again
                    let isSamePoint = (tooltip.x === data.x && tooltip.y ===  data.y)

                    // if clicked on the same point again toggle visibility
                    // else,render tooltip to new position and update its value
                    isSamePoint ? setTooltip((previousState)=> {
                        return {
                                ...previousState, 
                                value: data.value,
                                visible: !previousState.visible}
                        })
                    : setTooltip({
                        x: data.x, 
                        value: data.value, y: data.y,
                        visible: true
                    });
                } // end function
            }
            yAxisInterval={1} // optional, defaults to 1
            chartConfig={{
                backgroundColor: "#e26a00",
                backgroundGradientFrom: "#fb8c00",
                backgroundGradientTo: "#ffa726",
                decimalPlaces: 2, // optional, defaults to 2dp
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                style: {
                    borderRadius: 16
                },

                propsForDots: {
                    r: "6",
                    strokeWidth: "2",
                    stroke: "#ffa726"
                }
            }}
            style={{
                marginVertical: 8,
                // borderRadius: 16
            }}
            />
        </View>
    );
}

// export default class App extends React.Component {
//   render() {
//     return (
// 		<View>
// 		<Text>Bezier Line Chart</Text>
// 		<LineChart
// 		  data={{
// 			labels: ["January", "February", "March", "April", "May", "June"],
// 			datasets: [
// 			  {
// 				data: [
// 				  Math.random() * 100,
// 				  Math.random() * 100,
// 				  Math.random() * 100,
// 				  Math.random() * 100,
// 				  Math.random() * 100,
// 				  Math.random() * 100
// 				]
// 			  }
// 			]
// 		  }}
// 		  width={Dimensions.get("window").width} // from react-native
// 		  height={220}
// 		  yAxisLabel="$"
// 		  yAxisSuffix="k"
// 		  yAxisInterval={1} // optional, defaults to 1
// 		  chartConfig={{
// 			backgroundColor: "#e26a00",
// 			backgroundGradientFrom: "#fb8c00",
// 			backgroundGradientTo: "#ffa726",
// 			decimalPlaces: 2, // optional, defaults to 2dp
// 			color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
// 			labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
// 			style: {
// 			  borderRadius: 16
// 			},
// 			propsForDots: {
// 			  r: "6",
// 			  strokeWidth: "2",
// 			  stroke: "#ffa726"
// 			}
// 		  }}
// 		  style={{
// 			marginVertical: 8,
// 			borderRadius: 16
// 		  }}
// 		/>
// 	  </View>
//     );
//   }
// }