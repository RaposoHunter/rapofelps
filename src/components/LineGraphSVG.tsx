import React, {useEffect, useState} from 'react';
import { View, StyleSheet, Dimensions, Text, Image} from 'react-native';
import Svg, { Circle, Rect, Line, G, Text as TextSVG, Polygon, Image as ImageSVG } from 'react-native-svg';

import loadIcon from "../assets/loading-buffering.gif";

interface Reading {
    id: string,
    umidade: string,
    temperatura: string,
    co2: string,
    lido_em: string
}

interface GraphData {
    reading: Array<Reading>;
    graphMode: string;
    graphDate: Date;
    isLoading: boolean;
}

export function LineGraphSVG({reading, graphMode, graphDate, isLoading}: GraphData) {
    /*
        EXIBIR AS 6 ULTIMAS LEITURAS (EQUIVALENTE A 1H DE LEITURAS)
        
        POSSIBILITAR VER O RELATÓRIO DO DIA, SEMANA, MÊS E ANO

        ADICIONAR BOTÕES PARA VISUALIZAR OS LIMITES (INICIALMENTE DESLIGADOS)
    */

    let [tooltip, setTooltip] = useState({
         x:0, y:0, visible:false, value:0, observing:""
    });

    let [isTemperatureVisible, setIsTemperatureVisible] = useState(true);
    let [isHumidityVisible, setIsHumidityVisible] = useState(true);
    let [isCO2Visible, setIsCO2Visible] = useState(true);
    let [graphMenusAlpha, setGraphMenusAlpha] = useState([1,1,1]);    

    /* Se o os valores do gráfico vão de 0 -> height * 0.245 é necessário mapear os valores dos parâmetros das leituras
    *
    * umidade (%)             = 0 <-> 100
    * temperatura (°C)        = 0 <-> 32
    * concentração de CO2 (%) = 0 <-> 100
    */

    const map = (value: any, valueMin: any, valueMax: any, mapMin: any, mapMax: any) => {
        let result;

        if(value == null || isNaN(value)) {
            return 0;
        }

        result = (((mapMax - mapMin) * (value - valueMin)) / (valueMax - valueMin)) + mapMin;

        console.log(`.map() values => ${value} | ${valueMin} | ${valueMax} | ${mapMin} | ${mapMax} | ${result}`);

        return result;
    }

    const formatDate = (date: string) => { 
        if(date == "N/D") {
            return "N/D";
        }
        
        const data = new Date(date);

        const fDate = `${data.getFullYear()}/${data.getMonth() < 9 ? "0" + (data.getMonth() + 1) : data.getMonth() + 1}/${data.getDate() < 10 ? "0" + data.getDate() : data.getDate()}`;
        
        return fDate;
    } 

    const lastDay = (date: Date) => {
        const month = date.getMonth() + 1,
              year = date.getFullYear();

        if(month == 2) { // Fevereiro
            if(year % 4 == 0) { // É bissexto
                if(year % 100 == 0) { 
                    if(year % 400 == 0) {
                        return 29;
                    } else {
                        return 28;
                    }
                } else {
                    return 29;
                }
            } else {
                return 28;
            }
        } else if(month == 4 || month == 6 || month == 9 || month == 11) { // Abril, Junho, Setembro, Novembro
            return 30;
        } else 
            return 31;
    }

    const isLastDay = (date: Date) => { 
        const day = date.getDate(),
              month = date.getMonth() + 1,
              year = date.getFullYear();

        if(month == 2) { // Fevereiro
            if(year % 4 == 0) { // É bissexto
                if(year % 100 == 0) { 
                    if(year % 400 == 0) {
                        return day == 29;
                    } else {
                        return day == 28;
                    }
                } else {
                    return day == 29;
                }
            } else {
                return day == 28;
            }
        } else if(month == 4 || month == 6 || month == 9 || month == 11) { // Abril, Junho, Setembro, Novembro
            return day == 30;
        } else 
            return day == 31;
    }

    const toggleTemperatureView = () => {        
        setGraphMenusAlpha([isTemperatureVisible ? 0.5 : 1, graphMenusAlpha[1], graphMenusAlpha[2]]);
        setIsTemperatureVisible(!isTemperatureVisible);

        if(tooltip.observing == "temperatura") {
            let {visible, ...rest} = tooltip;
            setTooltip({visible: false, ...rest});
        }
    }

    const toggleHumidityView = () => {
        setGraphMenusAlpha([graphMenusAlpha[0], isHumidityVisible ? 0.5 : 1, graphMenusAlpha[2]]);
        setIsHumidityVisible(!isHumidityVisible);

        if(tooltip.observing == "umidade") {
            let {visible, ...rest} = tooltip;
            setTooltip({visible: false, ...rest});
        }
    }

    const toggleCO2View = () => {
        setGraphMenusAlpha([graphMenusAlpha[0], graphMenusAlpha[1], isCO2Visible ? 0.5 : 1]);
        setIsCO2Visible(!isCO2Visible);

        if(tooltip.observing == "co2") {
            let {visible, ...rest} = tooltip;
            setTooltip({visible: false, ...rest});
        }
    }

    const manageTooltip = function (x: any, y: any, value: any, observing: string) {        
        setTooltip({
            x: x,
            y: y,
            visible: true,
            value: value || 0,
            observing: observing
        });
    }

    const width = Dimensions.get("screen").width;
    const height = Dimensions.get("screen").height;
    const graphMenusSize = 10;
    const verticalLayersWidth = 15;

    let day = graphDate.getDate();
    let month = graphDate.getMonth() + 1;
    let year = graphDate.getFullYear(); 

    let monthDays = month <= 7 ? (month % 2 == 1 ? 31 : (month == 2 ? (year % 4 ? 29 : 28 ) : 30)) : (month % 2 == 1 ? 30 : 31);
    let yearDays = year % 4 ? 366 : 365;
    
    const graphModes = Object.freeze({
        "daily": 144,
        "weekly": 144 * 7,
        "monthly": 144 * monthDays,
        "yearly": 144 * yearDays
    });

    const graphDot = Object.freeze({
        size: 2,
        color: {
            temperature: "red",
            humidity: "blue",
            co2: "green"
        }
    });

    const graphLine = Object.freeze({
        main: "white",
        secondary: "rgba(255,255,255,0.3)"
    });

    let graphPoints = {
        temperature: Array<any>(),
        humidity: Array<any>(),
        co2: Array<any>()
    }

    let graphLines = {
        temperature: Array<any>(),
        humidity: Array<any>(),
        co2: Array<any>()
    }

    let graphXAxisLabels = {
        time: Array<any>(),
    };

    let graphYAxisLabels = {
        temperature: Array<any>(),
        humidity_co2: Array<any>()
    }

    let graphXAxisLines = Array<JSX.Element>();
    let graphYAxisLines = Array<JSX.Element>();

    const xLabelUnit = {
        daily: "Hora do Dia",
        weekly: "Dia na semana",
        monthly: "Dia do mês",
        yearly: "Dia do ano"
    }

    const weekdays   = Object.freeze(["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]);
    const yearmonths = Object.freeze(["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dec"]);

    let iterations = graphMode == "weekly" ? 7 : (graphMode == "yearly" ? 12 : (graphMode == "monthly" ? 6 : 5));
    let toBeParsedDate_begin = "";
    let toBeParsedDate_end = "";

    if(graphMode == "yearly") {
        toBeParsedDate_begin = `${year}/`;
        toBeParsedDate_end   = `${year + 1}/`;
    } else if(graphMode == "monthly") {
        if(month == 12) {
            toBeParsedDate_begin = `${year}/12`;
            toBeParsedDate_end   = `${year + 1}/`;
        } else {
            toBeParsedDate_begin = `${year}/${month}`;
            toBeParsedDate_end   = `${year}/${month + 1}`;
        }
    } else if(graphMode == "daily") {
        if(isLastDay(graphDate)) {
            if(month == 12) {
                toBeParsedDate_begin = `${year}/12/31`;
                toBeParsedDate_end   = `${year + 1}/`;
            } else {
                toBeParsedDate_begin = `${year}/${month}/${day}`;
                toBeParsedDate_end   = `${year}/${month}/${day + 1}`;
            }
        } else {
            toBeParsedDate_begin = `${year}/${month}/${day}`;
            toBeParsedDate_end   = `${year}/${month}/${day + 1}`;
        }
    }
    
     

    // Mapear o x de cada leitura baseado no Date.parse()
    /* cx={ reading[i] ? map( 
            Date.parse(reading[i].lido_em),                 // Valor atual da data
            Date.parse(toBeParsedDate_begin),               // Menor valor da data
            Date.parse(toBeParsedDate_end),                 // Maior Valor da data
            0,                                              // Menor valor do gráfico
            width*0.7                                       // Maior valor do gráfico
        ) 
        : 0 
    } */
    

    console.log("A", toBeParsedDate_begin, toBeParsedDate_end);
    console.log("C", Date.parse(toBeParsedDate_begin), Date.parse(toBeParsedDate_end));
    for(let i = 0; i < reading.length; i++) {
        if(graphMode == "daily" && Date.parse(reading[i].lido_em) > Date.parse(`${year}/${month}/${day} 23:59:59`)) 
            break;
        else if(graphMode == "monthly" && Date.parse(reading[i].lido_em) > Date.parse(`${year}/${month}/${lastDay(graphDate)} 23:59:59`)) 
            break;
        
        // graphPoints.temperature.push(
        //     <Circle key={ `temperature_value_${i}` } cx={i*width*0.7/(graphModes[graphMode] - 1)} cy={ reading[i] ? map(reading[i].temperatura, 0, 32, 0, height * 0.245) : 0 } fill={ graphDot.color.temperature } r={ graphDot.size } onPress={() => manageTooltip(i*width*0.7/(graphModes[graphMode] - 1), reading[i] ? map(reading[i].temperatura, 0, 32, 0, height * 0.245) : 0,reading[i] ? reading[i].temperatura : 0, "temperatura")}/>
        // );

        // NaN nos toBeParsed
        graphPoints.temperature.push(
            <Circle key={ `temperature_value_${i}` } cx={reading[i] ? map(Date.parse(reading[i].lido_em), Date.parse(toBeParsedDate_begin), Date.parse(toBeParsedDate_end), 0, width*0.7) : 0} cy={ reading[i] ? map(reading[i].temperatura, 0, 32, 0, height * 0.245) : 0 } fill={ graphDot.color.temperature } r={ graphDot.size } onPress={() => manageTooltip(i*width*0.7/(graphModes[graphMode] - 1), reading[i] ? map(reading[i].temperatura, 0, 32, 0, height * 0.245) : 0,reading[i] ? reading[i].temperatura : 0, "temperatura")}/>
        );

        graphPoints.humidity.push(
            <Circle key={ `humidity_value_${i}` } cx={i*width*0.7/(graphModes[graphMode] - 1)} cy={ reading[i] ? map(reading[i].umidade, 0, 100, 0, height * 0.245) : 0 } fill={ graphDot.color.humidity } r={ graphDot.size } onPress={() => manageTooltip(i*width*0.7/(graphModes[graphMode] - 1), reading[i] ? map(reading[i].umidade, 0, 100, 0, height * 0.245) : 0, reading[i] ? reading[i].umidade : 0, "umidade")}/>
        );

        graphPoints.co2.push(
            <Circle key={ `co2_value_${i}` } cx={i*width*0.7/(graphModes[graphMode] - 1)} cy={ reading[i] ? map(reading[i].co2, 0, 100, 0, height * 0.245) : 0 } fill={ graphDot.color.co2 } r={ graphDot.size } onPress={() => manageTooltip(i*width*0.7/(graphModes[graphMode] - 1), reading[i] ? map(reading[i].co2, 0, 100, 0, height * 0.245) : 0, reading[i] ? reading[i].co2 : 0, "co2")}/>
        );
    }
    

    /*for(let i = 0; i < graphModes[graphMode] - 1; i++) {
        // graphLines.temperature.push(
        //     <Line key={ `temperature_line_${i}` } x1={i*width*0.7/(graphModes[graphMode] - 1)} y1={ reading[i] ? map(reading[i].temperatura, 0, 32, 0, height * 0.245) : 0 } x2={(i+1)*width*0.7/(graphModes[graphMode] - 1)} y2={ reading[i+1] ? map(reading[i+1].temperatura, 0, 32, 0, height * 0.245) : 0 } stroke="#f00" strokeWidth="1"/>
        // );
        console.log(i, reading[i]);
        graphLines.temperature.push(
            <Line key={ `temperature_line_${i}` } x1={reading[i] ? map(Date.parse(reading[i].lido_em), Date.parse(toBeParsedDate_begin), Date.parse(toBeParsedDate_end), 0, width*0.7) : 0} y1={ reading[i] ? map(reading[i].temperatura, 0, 32, 0, height * 0.245) : 0 } x2={reading[i+1] ? map(Date.parse(reading[i+1].lido_em), Date.parse(toBeParsedDate_begin), Date.parse(toBeParsedDate_end), 0, width*0.7) : 0} y2={ reading[i+1] ? map(reading[i+1].temperatura, 0, 32, 0, height * 0.245) : 0 } stroke="#f00" strokeWidth="1"/>
        );

        graphLines.humidity.push(
            <Line key={ `humidity_line_${i}` } x1={i*width*0.7/(graphModes[graphMode] - 1)} y1={ reading[i] ? map(reading[i].umidade, 0, 100, 0, height * 0.245) : 0 } x2={(i+1)*width*0.7/(graphModes[graphMode] - 1)} y2={ reading[i+1] ? map(reading[i+1].umidade, 0, 100, 0, height * 0.245) : 0 } stroke="#00f" strokeWidth="1"/>
        );

        graphLines.co2.push(
            <Line key={ `co2_line_${i}` } x1={i*width*0.7/(graphModes[graphMode] - 1)} y1={ reading[i] ? map(reading[i].co2, 0, 100, 0, height * 0.245) : 0 } x2={(i+1)*width*0.7/(graphModes[graphMode] - 1)} y2={ reading[i+1] ? map(reading[i+1].co2, 0, 100, 0, height * 0.245) : 0 } stroke="#0f0" strokeWidth="1"/>
        );
    }*/

    for(let i = 0; i < iterations; i++) {
        graphXAxisLabels.time.push(
            <TextSVG key={ `x_label_time_${i}` } textAnchor="middle" fill="white" x={i*width*0.7/(iterations - 1)}>
                { /*formatDate(reading[i] ? reading[i].lido_em : "N/D").time*/ iterations == 7 ? weekdays[i] : (iterations == 12 ? yearmonths[i] : i * 6)}
            </TextSVG>
        );

        if(i == 0) continue;

        graphYAxisLines.push(
            <Line key={ `y_secondary_axis_${i-1}` } x1={i*width*0.7/(iterations - 1)} y1="0" x2={i*width*0.7/(iterations - 1)} y2={height * 0.245} stroke={graphLine.secondary} strokeWidth="1"/>
        );
        

        // graphXAxisLabels.date.push(
            // <TextSVG key={ `x_label_date_${i}` } textAnchor="middle" fill="white" x={i*width*0.7/5}>
            //     { /*formatDate(reading[i] ? reading[i].lido_em : "N/D").date*/ 10 }
            // </TextSVG>
        // );
    }

    for(let i = 0; i < 5; i++) {
        graphYAxisLabels.temperature.push(
            <TextSVG key={ `y_label_temperature_${i}` } textAnchor="end" fill="white" y={-i*height * 0.245/4}>
                { `${i * 8} °C` }
            </TextSVG>
        );

        graphYAxisLabels.humidity_co2.push(
            <TextSVG key={ `y_label_humidity_co2_${i}` } textAnchor="start" fill="white" y={-i*height * 0.245/4}>
                { `${i * 25}%` }
            </TextSVG>
        );

        if(i == 0) continue;

        graphXAxisLines.push(
            <Line key={ `x_secondary_axis_${i-1}` } x1="0" y1={i*height * 0.245/4} x2={width * 0.7} y2={i*height * 0.245/4} stroke={graphLine.secondary} strokeWidth="1"/>
        );
    }

    return (
        <Svg height="40%" width="100%" style={ styles.svg }>
            <Rect x={width * verticalLayersWidth/100} y="0" width="10%" height={width * graphMenusSize/100} fill={`rgba(255,0,0,${graphMenusAlpha[0]})`} onPress={toggleTemperatureView}/>
            <Rect x={width * verticalLayersWidth/100 + width * 0.1} y="0" width="10%" height={width * graphMenusSize/100} fill={`rgba(0,0,255,${graphMenusAlpha[1]})`} onPress={toggleHumidityView}/>
            <Rect x={width * verticalLayersWidth/100 + width * 0.2} y="0" width="10%" height={width * graphMenusSize/100} fill={`rgba(0,255,0,${graphMenusAlpha[2]})`} onPress={toggleCO2View}/> 
            
            <TextSVG textAnchor="middle" fill="white" x={width * verticalLayersWidth/100 + width * 0.05} y="10%">°C</TextSVG>
            <TextSVG textAnchor="middle" fill="white" x={width * verticalLayersWidth/100 + width * 0.15} y="10%">UR</TextSVG>
            <TextSVG textAnchor="middle" fill="black" x={width * verticalLayersWidth/100 + width * 0.25} y="10%">CO2</TextSVG>

            <G scaleY="-1" origin={`${width*0.35}, ${height * 0.245 / 2}`} translateX={width * verticalLayersWidth/100} translateY={width * graphMenusSize/100}>
                <>
                    <Line x1="0" y1="0" x2="0" y2={height * 0.245} stroke={graphLine.main} strokeWidth="2"/>
                    <Line x1="0" y1="0" x2={width * 0.7} y2="0" stroke={graphLine.main} strokeWidth="2"/>

                    { graphXAxisLines }
                    { graphYAxisLines }
                </>
        
                <>
                    <G scaleY="-1" translateX={width * -0.15/4} translateY="-4">
                        { graphYAxisLabels.temperature }
                    </G>

                    <G scaleY="-1" translateX={width * 0.75} translateY="-4">
                        { graphYAxisLabels.humidity_co2 }
                    </G>

                    <G scaleY="-1" translateY={-height * 0.4 * 0.15/2}>
                        { graphXAxisLabels.time }
                    </G>

                    <G scaleY="-1" translateY={-height * 0.4 * 0.15}>
                        <TextSVG key={ `x_label_unit` } textAnchor="middle" fill="white" x={2.5*width*0.7/5}>
                            { xLabelUnit[graphMode] }
                        </TextSVG>
                    </G>
                    
                </>

                { isLoading ? 
                    <Image 
                        style={{ width: 50, height: 50, position: "absolute", left: width * 0.5 - 25, top: height * 0.245 / 2 + 11}}
                        source={loadIcon}
                    />

                    : 
                <>
                    { isTemperatureVisible && 
                    <>
                        { graphLines.temperature }
                        { graphPoints.temperature }
                    </> 
                    }

                    { isHumidityVisible && 
                    <>
                        { graphLines.humidity }
                        { graphPoints.humidity }
                    </> 
                    }

                    { isCO2Visible && 
                    <>  
                        { graphLines.co2 }
                        { graphPoints.co2 }
                    </> 
                    }

                    { tooltip.visible && 
                    <View>
                        <G scaleY="-1" originY={tooltip.y + 25}>
                            <Rect x={tooltip.x - 25} y={tooltip.y + 10} width="50" height="30" fill="black" />
                            <Polygon scaleY="-1" originY={tooltip.y + 25} points={`${tooltip.x},${tooltip.y} ${tooltip.x-5},${tooltip.y+10} ${tooltip.x+5},${tooltip.y+10}`} fill="black"/>
                            <TextSVG
                                x={tooltip.x}
                                y={tooltip.y + 30}
                                fill="white"
                                fontSize="12"
                                fontWeight="bold"
                                textAnchor="middle"
                            >
                                {tooltip.value}
                            </TextSVG>
                        </G>
                    </View>
                    }
                </>
                }
            </G>  
            
        </Svg>
    );
}

const styles = StyleSheet.create({
    svg: {
        borderColor: "black",
        backgroundColor: "orange",
        borderWidth: 1
    },

    tooltip: {
        borderRadius: 5,
        backgroundColor: "black"
    }
});

// <Rect x="0" y="0" width={ verticalLayersWidth + "%"} height="100%" fill="black"/>
// <Rect x={width - width * verticalLayersWidth/100} y="0" width={ verticalLayersWidth + "%"} height="100%" fill="black"/>
// <Rect x={width * verticalLayersWidth/100} y="0" width="70%" height="83%" fill="red"/>
// <Rect x={width * verticalLayersWidth/100} y={height*0.300} width="70%" height="17%" fill="green"/>

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