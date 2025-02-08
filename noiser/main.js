/*

main.js

*/

let flag = true
let cvs = document.getElementById("canvas")
let imageData
let ren = 0
let flame = 1
let color = 0x040202

function new_array() {
  let data = new Uint16Array(2 * cvs.width * cvs.height)
  for (let y = 0; y < cvs.height; y++) {
    for (let x = 0; x < cvs.width; x++) {
      let ix = 2 * (y * cvs.width + x)
      data[ix] = x
      data[ix + 1] = y
    }
  }
  return data
}

async function resize() {
  if(flag === true) {
    flag = false

    cvs.width = (document.documentElement.clientWidth + (0x20 - 1)) & ~(0x20 - 1)
    cvs.height = document.documentElement.clientHeight
  
    if (ren !== 0) ren.delete_device()
    ren = new webgpuControl("")
    await ren.setup()
    ren.setCode(`
    var<private> rand = array<f32, 9>(
      ${(Math.random() * 5000 + 0.001).toFixed(10)},
      ${(Math.random() * 5000 + 0.001).toFixed(10)},
      ${(Math.random() * 5000 + 0.001).toFixed(10)},
      ${(Math.random() * 5000 + 0.001).toFixed(10)},
      ${(Math.random() * 5000 + 0.001).toFixed(10)},
      ${(Math.random() * 5000 + 0.001).toFixed(10)},
      ${(Math.random() * 5000 + 0.001).toFixed(10)},
      ${(Math.random() * 5000 + 0.001).toFixed(10)},
      ${(Math.random() * 5000 + 0.001).toFixed(10)},
    );

    var<private> p = array<i32, 512>(
      151,160,137,91,90,15,
	    131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
	    190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
	    88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,
	    77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
	    102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,
	    135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,
	    5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
	    223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,
	    129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,
	    251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,
	    49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,
	    138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180,
      151,160,137,91,90,15,
	    131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
	    190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
	    88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,
	    77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
	    102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,
	    135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,
	    5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
	    223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,
	    129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,
	    251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,
	    49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,
	    138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180
    );
    
    fn fade(t: f32) -> f32 {
	    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
    }
    
    fn grad(hash: i32, x: f32, y: f32, z: f32) -> f32 {
      switch (hash & 0xf) {
        case 0x0: { return  x + y; }
        case 0x1: { return -x + y; }
        case 0x2: { return  x - y; }
        case 0x3: { return -x - y; }
        case 0x4: { return  x + z; }
        case 0x5: { return -x + z; }
        case 0x6: { return  x - z; }
        case 0x7: { return -x - z; }
        case 0x8: { return  y + z; }
        case 0x9: { return -y + z; }
        case 0xA: { return  y - z; }
        case 0xB: { return -y - z; }
        case 0xC: { return  y + x; }
        case 0xD: { return -y + z; }
        case 0xE: { return  y - x; }
        case 0xF: { return -y - z; }
        default:  { return 0; }
      }
    }

    fn lerp(a: f32, b: f32, x: f32) -> f32 {
      return a + x * (b - a);
    }

    fn lerp2(a: vec2<f32>, b: vec2<f32>, x: f32) -> vec2<f32> {
      return a + x * (b - a);
    }

    fn perlin(px: f32, py: f32, pz: f32) -> f32 {
      let xi = i32(px) % 255;
      let yi = i32(py) % 255;
      let zi = i32(pz) % 255;

      let x = px - f32(i32(px));
      let y = py - f32(i32(py));
      let z = pz - f32(i32(pz));

	    let u = fade(x);
	    let v = fade(y);
	    let w = fade(z);

	    let aaa = p[p[p[xi] + yi] + zi];
      let aba = p[p[p[xi] + yi + 1] + zi];
      let aab = p[p[p[xi] + yi] + zi + 1];
      let abb = p[p[p[xi] + yi + 1] + zi + 1];
      let baa = p[p[p[xi + 1] + yi] + zi];
      let bba = p[p[p[xi + 1] + yi + 1] + zi];
      let bab = p[p[p[xi + 1] + yi] + zi + 1];
      let bbb = p[p[p[xi + 1] + yi + 1] + zi + 1];

      var x1 = lerp(grad(aaa, x, y, z), grad(baa, x - 1.0, y, z), u);
      var x2 = lerp(grad(aba, x, y - 1.0, z), grad(bba, x - 1.0, y - 1.0, z), u);
      let y1 = lerp(x1, x2, v);
      
      x1 = lerp(grad(aab, x, y, z - 1.0), grad(bab, x - 1.0, y, z - 1.0), u);
      x2 = lerp(grad(abb, x, y - 1.0, z - 1.0), grad(bbb, x - 1.0, y - 1.0, z - 1.0), u);
      let y2 = lerp(x1, x2, v);

      return (lerp(y1, y2, w) + 1.0) / 2.0;
    }

    fn OctavePerlin(x: f32, y: f32, z: f32, octaves: i32, persistence: f32) -> f32 {
	    var total: f32 = 0;
      var frequency: f32 = 1;
      var amplitude: f32 = 1;
      var maxValue: f32 = 0;
      for(var i = 0; i < octaves; i++) {
		    total = total + perlin(x * frequency, y * frequency, z * frequency) * amplitude;
        maxValue = maxValue + amplitude;
        amplitude = amplitude * persistence;
        frequency = frequency * 2;
      }
      return total / maxValue;
    }

    @group(0) @binding(0)
    var<storage, read_write> input : array<u32>;
  
    @group(0) @binding(1)
    var<storage, read_write> data : array<atomic<u32>>;

    struct Uniform {
      time: f32,
      padding1: u32,
      padding2: u32,
      padding3: u32,
      color: u32,
    }

    @group(0) @binding(2)
    var<uniform> ufm: Uniform;
  
    @compute @workgroup_size(32, 1, 1)
    fn main(
      @builtin(global_invocation_id) global_id : vec3<u32>,
      @builtin(num_workgroups) numWork : vec3<u32>
    ) {
      var ix: u32 = global_id.y * numWork.x * 32 + global_id.x;
      var pos = vec2<u32>(((input[ix] << 16) >> 16), (input[ix] >> 16));

      let x1 = OctavePerlin((f32(pos.x) + rand[0]) / 100.0, (f32(pos.y) + rand[1]) / 100.0, (ufm.time + rand[2]), 2, 0.5);
      let y1 = OctavePerlin((f32(pos.x) + rand[3]) / 100.0, (f32(pos.y) + rand[4]) / 100.0, (ufm.time + rand[5]), 2, 0.5);
      //let z1 = OctavePerlin((f32(pos.x) + rand[6]) / 100.0, (f32(pos.y) + rand[7]) / 100.0, (ufm.time + rand[8]), 2, 0.5);
      //let x2 = OctavePerlin((f32(pos.x) + rand[0] + 0.001) / 100.0, (f32(pos.y) + rand[1] + 0.001) / 100.0, (ufm.time + rand[2] + 0.001), 2, 0.5);
      //let y2 = OctavePerlin((f32(pos.x) + rand[3] + 0.001) / 100.0, (f32(pos.y) + rand[4] + 0.001) / 100.0, (ufm.time + rand[5] + 0.001), 2, 0.5);
      //let z2 = OctavePerlin((f32(pos.x) + rand[6] + 0.001) / 100.0, (f32(pos.y) + rand[7] + 0.001) / 100.0, (ufm.time + rand[8] + 0.001), 2, 0.5);

      //pos.x = u32(f32(pos.x) + y1 * z2 - z1 * y2);
      //pos.y = u32(f32(pos.y) + z1 * x2 - x1 * z2);
      pos.x = u32(f32(pos.x) + x1 * 10.0);
      pos.y = u32(f32(pos.y) + y1 * 10.0);
      //input[ix] = (pos.y << 16) + pos.x;

      ix = pos.y * numWork.x * 32 + pos.x;
      atomicAdd(&data[ix], 0x040202);
      atomicSub(&data[ix + 1], 0x040202);
      atomicOr(&data[ix], 0xff000000);
      atomicAnd(&data[ix], 0xffff7f7f);
    }
    `)

    ren.setBuf(0, 4 * cvs.width * cvs.height, "DST", {data: new_array()})
    ren.setBuf(1, 4 * cvs.width * cvs.height, "SRC")
    ren.setBuf(2, 16 * 2, "UNIFORM", {data: new Float32Array([0.001, 0, 0, 0, color, 0, 0, 0])})
    ren.refresh()
  
    flag = true
  }
  else {
    setTimeout(resize, 0)
  }
}

async function redraw() {
  if(flag === true) {
    flag = false

    if (flame !== 1)
      ren.device.queue.writeBuffer(ren.bufList[2].resource.buffer, 0, new Float32Array([0.001 * flame, 0, 0, 0, color, 0, 0, 0]))
    ren.run(cvs.width / 32, cvs.height, 1)
    let obj = await ren.getBuf(1, 4 * cvs.width * cvs.height, 0)

    let data = new ImageData(new Uint8ClampedArray(obj[0]), cvs.width, cvs.height)
    let ctx = cvs.getContext("2d")
    ctx.putImageData(data, 0, 0)

    ren.unmap(obj)
    flag = true
  }

  flame++
  requestAnimationFrame(redraw)
}

async function init() {
  await resize()
  await redraw()
  window.addEventListener("resize", resize)
  addEventListener("click", () => { resize() })
}

init()

