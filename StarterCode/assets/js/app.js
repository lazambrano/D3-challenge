// import data.csv
d3.csv('assets/data/data.csv').then(data => {
    console.log("data.csv", data)

// Setting the SVG perimeter
let svgWidth = 950;
let svgHeight = 500;

// Setting the margins that will be used to get a chart area
let margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 75
};

// Chart area
let width = svgWidth - margin.left - margin.right;
let height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group, and shift the group
// rapper creation!
let svg = d3.select('#scatter')
    .append('svg')
    .attr('width', svgWidth)
    .attr('height', svgHeight);

// Append an SVG Group - shift the group
let chartGroup = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

// Initial Params
// Y axis is going to be healthcare or smokes or obese
// X axis is going to be poverty or age or HH Income
let chosenX = 'poverty';

// Create a function that will go through and update the x_scale upon clicking on the axis label
function xScale(poverty, chosenX) {
    // create linear scale
    let xLinearScale = d3.scaleLinear()
        .domain([d3.min(poverty, d => d[chosenX]) * 0.7 ,d3.max(poverty, d=> d[chosenX]) * 1.3])
        .range([0, width]);
    
    return xLinearScale;
}

// Function for rendering x-Axis, whenever we have a click event
function renderAxes(newXScale, xAxis) {
    let bottomAxis = d3.axisBottom(newXScale); 
    xAxis.transition().duration(1000).call(bottomAxis);
    return xAxis;
};

// function used for updating the circles group with a transition to new circles
function renderCircles(circlesGroup, newXScale, chosenX) {
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenX]))
    
    return circlesGroup;
};

// update the circles group with a new tooltip
function updateToolTip(chosenX, circlesGroup) {
    let label;

    if (chosenX === "poverty") {
        label = 'In Poverty (%):'
    }
    else {
        label = 'Age (Median)'
    }
    
    let toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html(function(d) {
            return (`${d.abbr}<br><br>${label} ${d[chosenX]}`);
        });
    
    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data);
    })
    .on("mouseout", function(data) {
        toolTip.hide(data);
    });
    return circlesGroup
}

d3.csv('assets/data/data.csv').then(data => {
    data.forEach(function(data) {
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
        //data.age = +data.age
    })

    let xLinearScale = xScale(data, chosenX);

    let yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(data, d=>d.healthcare)])
        .range([height, 0]);

    // just for the beginning
    let bottomAxis = d3.axisBottom(xLinearScale);
    let leftAxis = d3.axisLeft(yLinearScale);

    let xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0,${height})`)
        .call(bottomAxis);
    
    // append y axis
    chartGroup.append("g")
        .call(leftAxis);
    
    // append initial circles 
    let circlesGroup = chartGroup.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenX]))
        .attr("cy", d => yLinearScale(d.healthcare))
        .attr("r", 15)
        .attr("fill", "lightblue")
        .attr("opacity", "0.9")

    // append initial circles 
    chartGroup.selectAll("#scatter")
        .data(data)
        .enter()
        .append("text")
        .attr("text-anchor", "middle")
        .attr("x", d => xLinearScale(d[chosenX]))
        .attr("y", d => yLinearScale(d.healthcare))
        .attr("fill", "black")
        .text(function(d){return d.abbr})


    
    let labelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`)
    
    let povertyLabels = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty")
        .classed("active", true)
        .text("In Poverty (%)");
    
    let ageLabels = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("y", 40)
        .attr("value", "age")
        .classed("inactive", true)
        .text("Age (Median)");
    
    // Set up y axis label
    chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .classed("axis-text", true)
        .text("Lacks Healthcare (%)");
    
    // updateToolTip
    circlesGroup = updateToolTip(chosenX, circlesGroup)

    labelsGroup.selectAll("text")
        .on("click", function() {
            let value = d3.select(this).attr("value");
            if (value !== chosenX) {
                chosenX = value;
                console.log(chosenX);
                xLinearScale = xScale(poverty, chosenX);
                xAxis = renderAxes(xLinearScale, xAxis);
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenX);
                circlesGroup = updateToolTip(chosenX, circlesGroup);


                if (chosenX === "age") {
                    ageLabels
                        .classed("active", true)
                        .classed("inactive", false);
                    povertyLabels
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    ageLabels
                        .classed("active", false)
                        .classed("inactive", true);
                    povertyLabels
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        })
})


}).catch(err => console.log(err))

