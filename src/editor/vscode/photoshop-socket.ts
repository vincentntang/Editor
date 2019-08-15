import { DynamicTexture } from 'babylonjs';
import * as SocketIO from 'socket.io-client';

import Editor from "../editor";

export default class PhotoshopSocket {
    /**
     * The socket client reference.
     */
    public static Socket: SocketIOClient.Socket = null;

    /**
     * Creates the photoshop socket used to get live texturing.
     * @param editor the editor reference.
     */
    public static Create (editor: Editor): void {
        this.Socket = SocketIO(`http://localhost:1336`);
        this.Socket.on('connect', () => {
            // debugger;
        });

        this.Socket.on("document", (image) => {
            let texture = <DynamicTexture> editor.core.scene.textures.find(t => t.name === image.name && t instanceof DynamicTexture);

            // If exists, check dimensions
            if (texture) {
                const size = texture.getSize();
                if (size.width !== image.width || size.height !== image.height) {
                    texture.dispose();
                    texture = null;
                }
            }

            // Don't exists or removed, create it
            if (!texture) {
                texture = new DynamicTexture(image.name, { width: image.width, height: image.height }, editor.core.scene, false);
            }

            const ctx = texture.getContext();
            ctx.putImageData(new ImageData(new Uint8ClampedArray(image.pixels), image.width, image.height), 0, 0);
            texture.update(true);

            // Force render scene
            editor.core.renderScenes = true;
        });
    }
}
