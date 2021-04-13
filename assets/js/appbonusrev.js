var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 60,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function yScale(metroData, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(metroData, d => d[chosenYAxis]) * 0.8,
      d3.max(metroData, d => d[chosenYAxis]) * 1.2
    ])
    .range([0, width]);

  return yLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderAxes(newYScale, yAxis) {
  var bottomAxis = d3.axisBottom(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenYAxis, circlesGroup) {

  var label;

  if (chosenYAxis === "healthcare") {
    label = "Healthcare:";
  }
  if (chosenYAxis === "smokes") {
      label = "Smokers:";
  }
  if (chosenYAxis === "obesity") {
    label = "Obesity:";
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.abbr}<br>${label} ${d[chosenYAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("/assets/data/data.csv").then(function(metroData, err) {
  if (err) throw err;

  // parse data
  metroData.forEach(function(data) {
    data.poverty = +data.poverty;
    data.healthcare = +data.healthcare;
    data.smokes = +data.smokes;
    data.obesity = +data.obesity;
  });

  // xLinearScale function above csv import
  var yLinearScale = yScale(metroData, chosenYAxis);

  // Create y scale function
  var xLinearScale = d3.scaleLinear()
    .domain([0, d3.max(metroData, d => d.poverty)])
    .range([height, 0]);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(yLinearScale);
  var leftAxis = d3.axisLeft(xLinearScale);

  // append x axis
  var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  chartGroup.append("g")
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(metroData)
    .enter()
    .append("circle")
    .attr("cx", d => yLinearScale(d[chosenYAxis]))
    .attr("cy", d => xLinearScale(d.poverty))
    .attr("r", 20)
    .attr("fill", "pink")
    .attr("opacity", ".5");

    

  // Create group for two x-axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

//   var povertyLabel = labelsGroup.append("text")
//     .attr("x", 0)
//     .attr("y", 20)
//     .attr("value", "poverty") // value to grab for event listener
//     .classed("active", true)
//     .text("In Poverty (%)");

  var healthcareLabel = labelsGroup.append("text")
    .attr("x", 40)
    .attr("y", 0)
    .attr("value", "healthcare") // value to grab for event listener
    .classed("inactive", true)
    .text("Lacks Healthcare (%)");

  var smokesLabel = labelsGroup.append("text")
    .attr("x", 40)
    .attr("y", 0)
    .attr("value", "smokes") // value to grab for event listener
    .classed("inactive", true)
    .text("Smokers (%)");

  var obesityLabel = labelsGroup.append("text")
    .attr("x", 40)
    .attr("y", 0)
    .attr("value", "obesity") // value to grab for event listener
    .classed("inactive", true)
    .text("Obese (%)");

  // append y axis
  chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", 0 - margin.left)
    .attr("y", 0 - (height / 2))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .text("% in Poverty");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenYAxis, circlesGroup);

  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {

        // replaces chosenXAxis with value
        chosenYAxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        yLinearScale = yScale(metroData, chosenYAxis);

        // updates x axis with transition
        yAxis = renderAxes(yLinearScale, yAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, yLinearScale, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenYAxis === "healthcare") {
          healthcareLabel
            .classed("active", true)
            .classed("inactive", false);
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
        //   povertyLabel
        //     .classed("active", true)
        //     .classed("inactive", false);
        }
        if (chosenYAxis === "smokes") {
          smokesLabel
              .classed("active", true)
              .classed("inactive", false);
          healthcareLabel
              .classed("active", false)
              .classed("inactive", true);
          obesityLabel
              .classed("active", false)
              .classed("inactive", true)
        //   povertyLabel
        //       .classed("active", true)
        //       .classed("inactive", false);
          }
        if (chosenYAxis === "obesity")  {
          obesityLabel
            .classed("active", true)
            .classed("inactive", false);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true)
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
        //   povertyLabel
        //     .classed("active", true)
        //     .classed("inactive", false);
        }
      }
    });
}).catch(function(error) {
  console.log(error);
});
