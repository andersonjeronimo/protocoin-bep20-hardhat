let matrix: number[][] = [
    [0, 0, 0, 0, 1],
    [0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1],
    [1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1]
];

/* 
  [ 0, 0, 0, 0, 0 ],
  [ 0, 0, 1, 0, 1 ],
  [ 3, 0, 1, 1, 1 ],
  [ 3, 0, 1, 0, 1 ],
  [ 3, 0, 0, 0, 1 ]
*/

let memory = 1;

for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
        if (matrix[i][j] > 0) {
            matrix[i][j] = memory;
            memory++;
            if (i > 0) {
                if (matrix[i - 1][j] > 0) {
                    matrix[i][j] = matrix[i - 1][j];
                    if (j > 0) {
                        if (matrix[i][j - 1] > 0) {
                            matrix[i][j] = matrix[i][j - 1];
                            matrix[i - 1][j] = matrix[i][j];
                        }
                    }
                }
                if (matrix[i - 1][j] == 0) {
                    if (j > 0) {
                        if (matrix[i][j - 1] > 0) {
                            matrix[i][j] = matrix[i][j - 1];
                        }
                    }
                }
            }
        }
    }
}

console.log(matrix);