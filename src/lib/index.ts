import { tuple } from "@/util";
import KDBush from "kdbush";

export function traceFrom(x_1, y_1, grid) {
  const branches: number[][][] = [];

  function checkPixel(x, y) {
    return grid[y] && grid[y][x];
  }

  function findNext(x, y, findAll = false) {
    const options: number[][] = [];
    //Check up/down/left/right first, and only diagonals if we don't find anything.
    //This will let us trace "staircases" as one line, and not a series or intersections.
    if (checkPixel(x, y - 1)) {
      options.push(tuple(x, y - 1));
    }
    if (checkPixel(x, y + 1)) {
      options.push(tuple(x, y + 1));
    }
    if (checkPixel(x - 1, y)) {
      options.push(tuple(x - 1, y));
    }
    if (checkPixel(x + 1, y)) {
      options.push(tuple(x + 1, y));
    }

    if (options.length && !findAll) {
      return options;
    }

    if (checkPixel(x - 1, y - 1)) {
      options.push(tuple(x - 1, y - 1));
    }
    if (checkPixel(x + 1, y - 1)) {
      options.push(tuple(x + 1, y - 1));
    }
    if (checkPixel(x - 1, y + 1)) {
      options.push(tuple(x - 1, y + 1));
    }
    if (checkPixel(x + 1, y + 1)) {
      options.push(tuple(x + 1, y + 1));
    }

    return options;
  }

  function collect(a, b, branch) {
    branch.push(tuple(a, b));
    grid[b][a] = 0;
  }

  function addBranch(startX, startY) {
    const branch: number[][] = [];
    collect(startX, startY, branch);
    branches.push(branch);
    return branch;
  }

  //Start by initing our main branch
  addBranch(x_1, y_1);

  for (let i = 0; i < branches.length; i++) {
    const branch = branches[i];
    let [x0, y0] = branch[0],
      [x, y] = branch[branch.length - 1];

    let nexts,
      pass = 1,
      endOfLine = false;
    while (true) {
      nexts = findNext(x, y);

      //If we reach an intersection:
      if (nexts.length > 1 && branch.length > 1) {
        //This may just be a 1px branch/noise, or a small section where the edge is 2px wide.
        //To test that, we look at all the pixels we can reach from the first step of a new branch.
        //If there are no more pixels than we can reach from our current position,
        //it's just noise and not an actual branch.
        const currentReach = findNext(x, y, true);
        let maxReach = -1,
          maxBranch,
          toDelete: number[][] = [];
        nexts = nexts.filter(([xx, yy]) => {
          const branchReach = findNext(xx, yy, true);
          const branchHasNewPixels = branchReach.some((px) => !currentReach.includes(px));

          if (branchReach.length > maxReach) {
            maxReach = branchReach.length;
            maxBranch = tuple(xx, yy);
          }

          //If we decide this is just noise, clear the pixel so it's not picked up by a later traceFrom().
          //Do that after this loop is finished, or else it will interfere with the other branches chance at a `maxReach`:
          if (!branchHasNewPixels) {
            toDelete.push(tuple(xx, yy));
          }

          return branchHasNewPixels;
        });
        toDelete.forEach(([xx, yy]) => (grid[yy][xx] = 0));

        //If we filtered away all the branches, keep the one with more pixels.
        //This lets us go around noisy corners or finish noisy line ends:
        if (nexts.length === 0) {
          nexts = [maxBranch];
        }

        //This is a real intersection of branches:
        if (nexts.length > 1) {
          nexts.forEach((coord) => {
            const otherBranch = addBranch(x, y);
            collect(coord[0], coord[1], otherBranch);
          });
          endOfLine = true;
        }
      }

      //Keep following the current branch:
      if (nexts.length && !endOfLine) {
        [x, y] = nexts[0];
        collect(x, y, branch);
      } else {
        endOfLine = true;
      }

      if (endOfLine) {
        if (pass === 1) {
          //Reverse and trace in the other direction from our starting point;
          branch.reverse();
          x = x0;
          y = y0;

          pass = 2;
          endOfLine = false;
        } else {
          break;
        }
      }
    }
  }
  return branches;
}

export function cluster(points, tolerance) {
  function avgPos(points) {
    const len = points.length;
    let sumX = 0,
      sumY = 0;
    points.forEach(([x, y]) => {
      sumX += x;
      sumY += y;
    });
    return [sumX / len, sumY / len];
  }

  function dist2(a, b) {
    const dx = a[0] - b[0],
      dy = a[1] - b[1];
    return dx * dx + dy * dy;
  }

  const clusters: {
    center: any;
    pointIds: any[];
  }[] = [];
  let pointInfos = points.map((p, i) => ({
    xy: p,
    //Below, we'll shrink this array of points step by step,
    //so we need to keep track of all points' positions in the original array
    //to report correct .pointIds at the end:
    origIndex: i,
  }));

  //Find and combine the densest cluster of points,
  //one at a time, until there are no clusters left:
  const minClusterDistance2 = 4 * tolerance * tolerance;
  let toRemove,
    failsafe = 0;
  do {
    toRemove = [];
    failsafe++;

    const newPoints = pointInfos.map((p) => p.xy);
    const index = new KDBush(newPoints);

    const clusterCombos = new Set();
    const tempClusters = newPoints
      .map(([x, y]) => {
        const pointIds = index.within(x, y, tolerance),
          population = pointIds.length;

        //We get duplicates of most clusters
        //(point A is right next to B, thus point B is also right next to A):
        const combo = tuple(...pointIds);
        if (clusterCombos.has(combo)) {
          return null;
        }
        clusterCombos.add(combo);

        //We can safely put aside clusters of population 1 (single points) right away.
        //These will never be a part of any actual cluster on subsequent recalculations:
        if (population === 1) {
          const id = pointIds[0],
            pointInfo = pointInfos[id];
          toRemove.push(id);
          clusters.push({
            center: pointInfo.xy,
            pointIds: [pointInfo.origIndex],
          });
          return null;
        }

        return { pointIds, population };
      })
      //Better to build a sorted array one item at a time in the loop above?
      //https://stackoverflow.com/questions/1344500/efficient-way-to-insert-a-number-into-a-sorted-array-of-numbers
      .filter((x) => x)
      .sort((a, b) => b.population - a.population);

    //Now, we can combine the densest clusters into one point as long as the clusters don't overlap.
    //If we find a group of overlapping clusters, we can only pick the largest one, and then recalculate.
    let prevCenter;
    for (const cl of tempClusters) {
      const ids = cl.pointIds,
        pop = cl.population,
        center = avgPos(ids.map((i) => newPoints[i]));

      let doCombine = false;
      if (prevCenter) {
        const dist = dist2(center, prevCenter);
        if (dist > minClusterDistance2) {
          doCombine = true;
        }
      }
      //This is the first and largest cluster. Always combine:
      else {
        doCombine = true;
      }
      if (!doCombine) {
        break;
      }

      toRemove.push.apply(toRemove, ids);
      clusters.push({
        center,
        pointIds: ids.map((i) => pointInfos[i].origIndex),
      });
      prevCenter = center;
    }

    pointInfos = pointInfos.filter((p, i) => !toRemove.includes(i));
  } while (pointInfos.length && failsafe < 999);

  return clusters;
}
