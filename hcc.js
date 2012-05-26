google.load('visualization', '1.0', {'packages':['corechart']});

INCREMENT = 10;

currentRow = 0;
sample1 = {name: 'Solution 2500', premium: 47.31, payPeriod: 26, deductible: 2500, percentage: 25, oopMax: 5000, totalPremium: 0}
sample2 = {name: 'PPO 40', premium: 90.23, payPeriod: 26, deductible: 750, percentage: 40, oopMax: 5000, totalPremium: 0}
sample3 = {name: 'PPO 20', premium: 130.38, payPeriod: 26, deductible: 250, percentage: 20, oopMax: 3500, totalPremium: 0}
sample4 = {name: 'Premier 10', premium: 195.46, payPeriod: 26, deductible: 250, percentage: 10, oopMax: 3000, totalPremium: 0}
empty = {name: '', premium: '', payPeriod: '', deductible: '', percentage: '', oopMax: '', totalPremium: ''}

google.setOnLoadCallback(loadPage);

function loadPage()
{
    drawChart([sample1, sample2, sample3, sample4]);
    fillRow(sample1);
    fillRow(sample2);
    fillRow(sample3);
    fillRow(sample4);
}

function fillRow(data)
{
    var deleteIndex = currentRow + 1
    var row = "".concat('<tr>',
                            '<th>$<input type="text" name="name' + currentRow + '" value="' + data.name + '" size="12" /></th>',
                            '<th>$<input type="text" name="premium' + currentRow + '" value="' + data.premium + '" size="4" /></th>',
                            '<th><input type="text" name="payPeriod' + currentRow + '" value="' + data.payPeriod + '" size="1" /></th>',
                            '<th>$<input type="text" name="deductible' + currentRow + '" value="' + data.deductible + '" size="3" /></th>',
                            '<th><input type="text" name="percentage' + currentRow + '" value="' + data.percentage + '" maxlength="3" size="1" />%</th>',
                            '<th>$<input type="text" name="oopMax' + currentRow + '" value="' + data.oopMax + '" size="4" /></th>',
                            '<th><input type="button" onclick="deleteRow(' + deleteIndex + ')" value="X" size="2" /></th>',
                        '</tr>');
    // I hate javascript so much right now for doing ' + currentRow + '
    // I just wanted to use a string.format :(
    ++currentRow;
                            
    $('#insurancePlansTable tr:last').after(row);
}

function addRow()
{
    fillRow(empty);
}

function deleteRow(index)
{
    document.getElementById("insurancePlansTable").deleteRow(index);
}


function updateChart()
{
    var choices = getChoices();
    drawChart(choices);
}

function getChoices()
{
    var values = {};
    $.each($('#insurancePlansForm').serializeArray(), function(i, field) {
        values[field.name] = field.value;
    });
    var choices = []
    for (cr = 0; cr < currentRow; ++cr)
    {
        var premium = parseFloat(values['premium'+cr]);
        var payPeriod = parseFloat(values['payPeriod'+cr]);
        var totalPremium = premium * payPeriod;
        
        if (!isNaN(premium) && !isNaN(payPeriod))
        {
            choices.push({name: values['name'+cr],
                       premium: premium,
                       payPeriod: payPeriod,
                       deductible: parseFloat(values['deductible'+cr]),
                       percentage: parseFloat(values['percentage'+cr]),
                       oopMax: parseFloat(values['oopMax'+cr]),
                       totalPremium: totalPremium});
        }
    }
    return choices;
}


function drawChart(choices)
{
    var maxToShow = 0;

    var data = new google.visualization.DataTable();
    data.addColumn('number', 'Medical Cost');
    for (c = 0; c < choices.length; ++c)
        data.addColumn('number', choices[c].name);
    
    setPremium(choices);
    maxToShow = determineMaxCost(choices);
    data.addRows(calculateRows(choices, maxToShow));

    var options = {'title':'What Is Your Max out of Pocket Costs for the Year?',
                   'width':800,
                   'height':600,
                   'hAxis': {title: 'Medical Costs'},
                   'vAxis': {title: 'Your Costs'}
                   };

    var wrapper = new google.visualization.ChartWrapper({
        chartType: 'LineChart',
        dataTable: data,
        options: options,
        containerId: 'chart_div'
    });
    
    wrapper.draw();
}

function setPremium(choices)
{
    for (c = 0; c < choices.length; ++c)
        choices[c].totalPremium = choices[c].premium * choices[c].payPeriod;
}

function determineMaxCost(choices)
{
    var max = 0
    for (c = 0; c < choices.length; ++c)
    {       
        var choicePercentage = (choices[c].percentage / 100.0);
        var choiceMax = choices[c].oopMax / choicePercentage * (1 - choicePercentage);
        
        if (max < choiceMax)
            max = choiceMax;
    }   
    max = max + (max * .07);
    return max;
}


function calculateRows(choices, maxToShow)
{
    var calc = []
    var currentCost = 0;

    for (i = 0; i < maxToShow; i = i + INCREMENT)
    {
        var row = []
        row.push(i);
    
        for (c = 0; c < choices.length; ++c)
        {
            currentCost = i;
            
            if (currentCost > choices[c].deductible)
            {
                var tempCost = currentCost - choices[c].deductible;
                currentCost = choices[c].deductible + tempCost * (choices[c].percentage / 100.0);
            }
            if (currentCost > choices[c].oopMax)
                currentCost = choices[c].oopMax;

            currentCost += choices[c].totalPremium;
            
            row.push(currentCost);
        }
        calc.push(row);
    }
    return calc;
}