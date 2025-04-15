/*  top : 
    v1  0.0,  1.0,  0.0
    bottom : 
    v2 -0.5,  0.0,  0.5,   
    v3  0.5,  0.0,  0.5,   
    v4  0.5,  0.0, -0.5,  
    v5 -0.5,  0.0, -0.5,
*/

export class Pyramid {
    constructor(gl, options = {}) {
        this.gl = gl;

        // Creating VAO and buffers
        this.vao = gl.createVertexArray();
        this.vbo = gl.createBuffer();
        this.ebo = gl.createBuffer();

        this.vertices = new Float32Array([
            // front face (v1, v2, v3)
             0.0,  1.0,  0.0,  -0.5,  0.0,  0.5,   0.5,  0.0,  0.5,
            // right face (v1, v3, v4)
             0.0,  1.0,  0.0,   0.5,  0.0,  0.5,   0.5,  0.0, -0.5,
            // back face (v1, v4, v5)
             0.0,  1.0,  0.0,   0.5,  0.0, -0.5,  -0.5,  0.0, -0.5,
            // left face (v1, v5, v2)
             0.0,  1.0,  0.0,  -0.5,  0.0, -0.5,  -0.5,  0.0,  0.5,
            // bottom face (v2, v5, v4, v3)
            -0.5,  0.0,  0.5,  -0.5,  0.0, -0.5,   0.5,  0.0, -0.5,   0.5,  0.0,  0.5,
        ]);

        this.normals = new Float32Array([
            // front face (v1, v2, v3)
            0, 0, 1,   0, 0, 1,   0, 0, 1,
            // right face  (v1, v3, v4)
            1, 0, 0,    1, 0, 0,    1, 0, 0,
            // back face (v1, v4, v5)
            0, 0, -1,   0, 0, -1,   0, 0, -1,
            // left face (v1, v5, v2)
            -1, 0, 0,  -1, 0, 0,  -1, 0, 0,        
            // bottom face (v2, v5, v4, v3)
            0, -1, 0,   0, -1, 0,   0, -1, 0,   0, -1, 0,
        ]);
        
        // if color is provided, set all vertices' color to the given color
        if (options.color) {
            for (let i = 0; i < 24 * 4; i += 4) {
                this.colors[i] = options.color[0];
                this.colors[i+1] = options.color[1];
                this.colors[i+2] = options.color[2];
                this.colors[i+3] = options.color[3];
            }
        } else {
            this.colors = new Float32Array([
                // front face (cyan)
                0, 1, 1, 1,   0, 1, 1, 1,   0, 1, 1, 1,
                // right face (red)
                1, 0, 0, 1,   1, 0, 0, 1,   1, 0, 0, 1,
                // back face (yellow)
                1, 1, 0, 1,   1, 1, 0, 1,   1, 1, 0, 1,
                // left face (purple)
                1, 0, 1, 1,   1, 0, 1, 1,   1, 0, 1, 1,
                // bottom face (green)
                0, 1, 0, 1,   0, 1, 0, 1,   0, 1, 0, 1,   0, 1, 0, 1      
                
            ]);
        }

        this.texCoords = new Float32Array([   //텍스쳐에 사용
            // front face (v0,v1,v2,v3)
            1, 1,   0, 1,   0, 0,   1, 0,
            // right face (v0,v3,v4,v5)
            0, 1,   0, 0,   1, 0,   1, 1,
            // top face (v0,v5,v6,v1)
            1, 0,   1, 1,   0, 1,   0, 0,
            // left face (v1,v6,v7,v2)
            1, 1,   0, 1,   0, 0,   1, 0,
            // bottom face (v7,v4,v3,v2)
            1, 1,   0, 1,   0, 0,   1, 0,
            // back face (v4,v7,v6,v5)
            0, 0,   1, 0,   1, 1,   0, 1
        ]);

        this.indices = new Uint16Array([
            // front face (v1, v2, v3)
            0, 1, 2, 
            // right face (v1, v3, v4)
            3, 4, 5, 
            // back face (v1, v4, v5)
            6, 7, 8, 
            // left face (v1, v5, v2)
            9, 10, 11, 
            // bottom face (v2, v5, v4,  / v4, v3, v2)
            12, 13, 14,   15, 16, 17 
        ]);
        

        this.sameVertices = new Uint16Array([
            0, 3, 6, 9,             // indices of the same vertices as v1
            1, 11, 12, 17,          // indices of the same vertices as v2
            2, 4, 15, 16,           // indices of the same vertices as v3
            5, 7, 14, 15,           // indices of the same vertices as v4
            8, 10, 13               // indices of the same vertices as v5
        ]);

        this.vertexNormals = new Float32Array(72);   // 라이팅에 사용
        this.faceNormals = new Float32Array(72);
        this.faceNormals.set(this.normals);

        // compute vertex normals (face normals 다시 계산하는 과정)
        for (let i = 0; i < 24; i += 3) {

            let vn_x = (this.normals[this.sameVertices[i]*3] + 
                       this.normals[this.sameVertices[i+1]*3] + 
                       this.normals[this.sameVertices[i+2]*3]) / 3; 
            let vn_y = (this.normals[this.sameVertices[i]*3 + 1] + 
                       this.normals[this.sameVertices[i+1]*3 + 1] + 
                       this.normals[this.sameVertices[i+2]*3 + 1]) / 3; 
            let vn_z = (this.normals[this.sameVertices[i]*3 + 2] + 
                       this.normals[this.sameVertices[i+1]*3 + 2] + 
                       this.normals[this.sameVertices[i+2]*3 + 2]) / 3; 

            this.vertexNormals[this.sameVertices[i]*3] = vn_x;
            this.vertexNormals[this.sameVertices[i+1]*3] = vn_x;
            this.vertexNormals[this.sameVertices[i+2]*3] = vn_x;
            this.vertexNormals[this.sameVertices[i]*3 + 1] = vn_y;
            this.vertexNormals[this.sameVertices[i+1]*3 + 1] = vn_y;
            this.vertexNormals[this.sameVertices[i+2]*3 + 1] = vn_y;
            this.vertexNormals[this.sameVertices[i]*3 + 2] = vn_z;
            this.vertexNormals[this.sameVertices[i+1]*3 + 2] = vn_z;
            this.vertexNormals[this.sameVertices[i+2]*3 + 2] = vn_z;
        }

        this.initBuffers();
    }

    copyVertexNormalsToNormals() {
        this.normals.set(this.vertexNormals);
    }

    copyFaceNormalsToNormals() {
        this.normals.set(this.faceNormals);
    }

    initBuffers() {
        const gl = this.gl;

        // 버퍼 크기 계산
        const vSize = this.vertices.byteLength;
        const nSize = this.normals.byteLength;
        const cSize = this.colors.byteLength;
        const tSize = this.texCoords.byteLength;
        const totalSize = vSize + nSize + cSize + tSize;

        gl.bindVertexArray(this.vao);

        // VBO에 데이터 복사
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, totalSize, gl.STATIC_DRAW);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertices);
        gl.bufferSubData(gl.ARRAY_BUFFER, vSize, this.normals);
        gl.bufferSubData(gl.ARRAY_BUFFER, vSize + nSize, this.colors);
        gl.bufferSubData(gl.ARRAY_BUFFER, vSize + nSize + cSize, this.texCoords);

        // EBO에 인덱스 데이터 복사
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ebo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

        // vertex attributes 설정
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);  // position
        gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, vSize);  // normal
        gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 0, vSize + nSize);  // color
        gl.vertexAttribPointer(3, 2, gl.FLOAT, false, 0, vSize + nSize + cSize);  // texCoord

        // vertex attributes 활성화
        gl.enableVertexAttribArray(0);
        gl.enableVertexAttribArray(1);
        gl.enableVertexAttribArray(2);
        gl.enableVertexAttribArray(3);

        // 버퍼 바인딩 해제
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindVertexArray(null);
    }

    updateNormals() {
        const gl = this.gl;
        const vSize = this.vertices.byteLength;

        gl.bindVertexArray(this.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        
        // normals 데이터만 업데이트
        gl.bufferSubData(gl.ARRAY_BUFFER, vSize, this.normals);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindVertexArray(null);
    }

    draw(shader) {

        const gl = this.gl;
        shader.use();
        gl.bindVertexArray(this.vao);
        gl.drawElements(gl.TRIANGLES, 18, gl.UNSIGNED_SHORT, 0);
        gl.bindVertexArray(null);
    }

    delete() {
        const gl = this.gl;
        gl.deleteBuffer(this.vbo);
        gl.deleteBuffer(this.ebo);
        gl.deleteVertexArray(this.vao);
    }
} 