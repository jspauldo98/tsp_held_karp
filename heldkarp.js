// Jared Spauding 
// 30 Nov. 2018
// COSC 3020 assignment 3

// Held-Karp Algrithm - Dynamically programed 
// acts as a constant cache (keeps track of the shortest path)
var incumbent1 = Infinity;

/**
 * setup for held karp
 * returns shortest distance from tour (distance matrix) given start
*/
function heldKarpSetup(tour, start) {

	// if just two cities, output distance between
	if (tour.length == 2)
		return tour[start][1];
	else {
	// create the first subset to send to main algorithm
	// will be tour - start 
	var subset = [];
	for (let i = 0; i < tour.length; i++) {
		if (i != start) 
			subset.push(i);
	}

	heldKarp(tour, subset,  0);
	return incumbent1;
	}

}

/**
 * Iterative held karp dynamically programed
 * could be optimized some
*/
function heldKarp(tourDist, cities) {

	// for last level of tree, will be the reduced total costs
	// reduced meaning the costs of total paths that cause extra work are not calculated
	var lastSubsets = false;

	// generate subsets of the cities - the start
	// ie. {}, {1}, {2}, {3}, {1,2}, {2,3}, {1,3} for 4 cities
	var allSubsets = generateSubsets(cities);

	// array that holds the subsets for each city
	// ie. [1, {}], [2, {}], [3, {}], [2, {1}], [3, {1}], [1, {2}], [3, {2}], 
	//     [1, {3}], [2, {3}], [3, {1, 2}], [1, {2, 3}], [2, {1,3}] for 4 cities
	var subsetCities = [];

	// array that holds the costs to each subsetCity index so cost can be looked up reducing duplicate work
	var subsetCosts = [];

	// loop through all subsets 
	for (let i = 0; i < allSubsets.length; i++) {
		// loop through cities remaining after removing start 
		for (let j = cities[0]; j <= cities.length; j++) {
			if (!elementOf(j, allSubsets[i])) {
				subsetCities.push([j, allSubsets[i]]);

				// calculating the base subsets [1, {}], [2, {}], [3, {}] for 4 cities
				if (allSubsets[i].length == 0) {
					subsetCosts.push(tourDist[i][j]);
				}
				// calculating the next base since dont have to loop yet [2, {1}], [3, {1}], [1, {2}], [3, {2}], 
				//     													 [1, {3}], [2, {3}] for 4 cities
				if (allSubsets[i].length == 1) {
					subsetCosts.push(tourDist[allSubsets[i][0]][j] + subsetCosts[allSubsets[i] - 1]);
				}

				// tricky party here [3, {1, 2}], [1, {2, 3}], [2, {1,3}] for 4 cities... this is where more cities will take lots of time
				if (allSubsets[i].length > 1) {
					// holds arrays to get the minimum from ie [3, {1, 2}] must use min value between subset [1, {2}] and [2, {1}] already calculated
					var toGetMin = [];
					// loop through specific subset 
					for (let x = 0; x < allSubsets[i].length; x++) {
						// placeholder array so all elements in subset are accounted for (> 4 cities important here)
						var test = [];
						// loop through values in subset to acertain values to take min of 
						for (let y = allSubsets[i].length; y > 0; y--) {
							
							if (allSubsets[i][x] != allSubsets[i][y-1]) {
								toGetMin.push(allSubsets[i][x]);
								test.push(allSubsets[i][y-1]);
								
								toGetMin.push(test.sort(function(a, b){return a - b}));
							}
						}
					}
					// this loop could probably be done a different way to save time as it organizes toGetMin to make next part easier
					var a = [];
					for (let x = 1; x < toGetMin.length; x+=2){
						a.push([toGetMin[x-1], toGetMin[x]]);
					}

					// holds the value of the sums from each subset to take the minimum value from
					var sumsToMin = [];

					// loop through the organized subset lookups 
					for (let x = 0; x < a.length; x++) {

						// if checking the last subsets remember the values 
						if (a[x][1].length == cities.length -2){
							lastSubsets = true;
						}
						else {
							lastSubsets = false;
						}

						// loop through the subsets the need to be looked up
						// only aplicatble when values are > 2 ... ie for subset [1, {2,3,4}] {2,3,4} > 2 values
						for (let z = 0; z < a[x][1].length; z++) {
							// what subset to add to what distance lookup before taking minimum
							// 		ie for 4 cities subset [3, {1, 2}] = distMatrix[1][3] + lookup value for [1, {2}]
							// 		then next loop of x = distMatrix[2][3] + lookup value for [2, {1}]
							if (a[x][1].length == 1) {
								sumsToMin.push(subsetCosts[searchForCost(a[x], subsetCities)] + tourDist[a[x][z]][j]);
							}
							else {
								sumsToMin.push(subsetCosts[searchForCost(a[x], subsetCities)] + tourDist[a[x][1][z]][j]);
							}
						} 
					}

					// take min of the sums of each subset
					cost = min(sumsToMin);
					// push to subsetCities cost placeholder
					subsetCosts.push(cost);

					// if last subsets then compare total costs to determine minimum
					if (cost < incumbent1 && lastSubsets) {
						incumbent1 = cost;
					}
				}
			}
		}
	}
	return incumbent1;
}

/**
 * returns subsets of array 
 * used code from Angelos Chalaris - StackOverflow.com
*/
function generateSubsets(array) {
  var result = [];
  result.push([]);

  for (var i = 1; i < (1 << array.length ); i++) {
    var subset = [];
    for (var j = 0; j < array.length ; j++)
      if (i & (1 << j))
        subset.push(array[j]);

    result.push(subset);
  }

  // pop the last subset that would be used for going back to start since directions say 
  // not to include returning to start
  result.pop();
  // probably better to do this in the looping above but this was easiest for me and works the same

  return result;
}

/**
 * return the element for cost of subset in subsetcities 
 * return -1 if subset does not exist
*/
function searchForCost(subset, subsetCities) {
	for (let i = 0; i < subsetCities.length; i++) {
		if (JSON.stringify(subset)==JSON.stringify(subsetCities[i]))
			return i;
	}

	return -1;
}

/**
 * returns true if a is an element of b
 * false otherwise
*/
function elementOf(a, b) {
	for (let i = 0; i < b.length; i++){
		if (a == b[i])
			return true;
	}

	return false;
}

/**
 * returns the minimum value in arr
*/
function min(arr) {
	var min = Infinity;

	for (let i =0; i< arr.length; i++) {
		if (arr[i] < min)
			min = arr[i];
	}

	return min;
}

console.time("held-Karp");

console.log(heldKarpSetup(tour12, 0));

console.timeEnd("held-Karp");