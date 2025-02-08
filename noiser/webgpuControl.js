/*

webgpuControl.js
  WebGPUのComputerShaderを使いやすくしたラッパークラス。
  exanple : setup -> setCode -> setBuf -> refresh -> run -> getBuf -> unmap -> delete_device

*/

class webgpuControl {
  constructor(label = "") {
    this.label = label
    this.bufList = []
    this.error = undefined
  }

  async setup() {
    if (!navigator.gpu) {
      this.error = "WebGPU not supported."
      return 0
    }
    else {
      this.adapter = await navigator.gpu.requestAdapter()
      if (!this.adapter) {
        this.error = "Couldn't request WebGPU adapter."
        return 0
      }
      this.device = await this.adapter.requestDevice({label : this.label})
    }
    return 0
  }

  setCode(code = " ") {
    if(this.error === undefined) {
      this.computeShaderModule = this.device.createShaderModule({code: code, label : (this.label + " : setCode")})
    }
  }

  setBuf(bindingIndex = 0, byteSize = 0, bufTypebuf = undefined, buf = undefined) {
    if(this.error === undefined) {
      let flag;
      if(bufTypebuf === "DST") {
        flag = GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
      }
      else if(bufTypebuf === "SRC") {
        flag = GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC
      }
      else if(bufTypebuf === "UNIFORM") {
        flag = GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
      }
      else {//"NON"
        flag = GPUBufferUsage.STORAGE
      }
      this.bufList[bindingIndex] = {
        binding : bindingIndex,
        resource : {
          buffer : this.device.createBuffer({
            size : byteSize, usage : flag,
            label : (this.label + " : setBuf(" + bindingIndex + ")")
          })
        }
      }

      if(buf !== undefined) {
        this.device.queue.writeBuffer(this.bufList[bindingIndex].resource.buffer, 0, buf.data, buf.offset, buf.size)
      }
    }
  }

  refresh(entryPoint = "main") {
    if(this.error === undefined) {
      this.computePipeline = this.device.createComputePipeline({
        layout : "auto",
        compute : {
          module : this.computeShaderModule,
          entryPoint : entryPoint
        },
        label : (this.label + " : run_createComputePipeline")
      })

      this.bindGroup = this.device.createBindGroup({
        layout : this.computePipeline.getBindGroupLayout(0),
        entries: this.bufList,
        label : (this.label + " : run_createBindGroup")
      })
    }
  }

  run(xLen = 1, yLen = 1, zLen = 1) {
    if(this.error === undefined) {
      let commandEncoder = this.device.createCommandEncoder({label : (this.label + " : run_createCommandEncoder")})
      let passEncoder = commandEncoder.beginComputePass({label : (this.label + " : run_beginComputePass")})
      passEncoder.setPipeline(this.computePipeline)
      passEncoder.setBindGroup(0, this.bindGroup)
      passEncoder.dispatchWorkgroups(xLen, yLen, zLen)
      passEncoder.end()
      
      this.device.queue.submit([commandEncoder.finish()])
    }
  }

  async getBuf(bindingIndex = 0, size = 0, offset = 0) {
    if(this.error === undefined) {
      let stagingBuffer = this.device.createBuffer({
        mappedAtCreation : false,
        size : size,
        usage : GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
        label : (this.label + " : getBuf(" + bindingIndex + ")")
      })
      
      let copyEncoder = this.device.createCommandEncoder({label : (this.label + " : getBuf_createCommandEncoder")})
      copyEncoder.copyBufferToBuffer(
        this.bufList[bindingIndex].resource.buffer, offset,
        stagingBuffer, 0, size
      )

      this.device.queue.submit([copyEncoder.finish()])
      await stagingBuffer.mapAsync(GPUMapMode.READ)
      let copyArrayBuffer = stagingBuffer.getMappedRange()
      
      return [copyArrayBuffer, stagingBuffer]
    }
  }

  unmap(obj = undefined) {
    if(this.error === undefined) {
      obj[1].unmap()
      obj[1].destroy()
    }
  }

  debug() {
    return this
  }

  delete_buffer() {
    for (let i = 0; i < this.bufList.length; i++) this.bufList[i].resource.buffer.destroy()
  }

  delete_device() {
    this.delete_buffer()
    this.device.destroy()
  }
}

