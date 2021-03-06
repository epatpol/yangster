/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License") you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { injectable, ContainerModule } from "inversify"
import { BaseLanguageServerContribution, IConnection, LanguageServerContribution } from "@theia/languages/lib/node"

import { createSocketConnection } from 'vscode-ws-jsonrpc/lib/server'
import * as net from 'net'

const EXECUTABLE = '../node_modules/theia-yang-extension/build/yang-language-server/bin/yang-language-server'

function getPort(): number|undefined {
    let arg = process.argv.filter(arg => arg.startsWith("--YANG_LSP="))[0]
    if (!arg) {
        return undefined
    } else {
        return Number.parseInt(arg.substring("--YANG_LSP=".length))
    }
}

@injectable()
class YangLanguageServerContribution extends BaseLanguageServerContribution {

    readonly id = 'yang'
    readonly name = 'Yang'

    readonly description = {
        id: 'yang',
        name: 'Yang',
        documentSelector: ['yang'],
        fileEvents: [
            '**/*.yang'
        ]
    }

    start(clientConnection: IConnection): void {
        let socketPort = getPort();
        if (socketPort) {
            const socket = new net.Socket()
            const serverConnection = createSocketConnection(socket, socket, () => {
                socket.destroy()
            });
            this.forward(clientConnection, serverConnection)
            socket.connect(socketPort)
        } else {
            const args: string[] = []
            const serverConnection = this.createProcessStreamConnection(EXECUTABLE, args)
            this.forward(clientConnection, serverConnection)
        }
    }

}

export default new ContainerModule(bind => {
    bind(LanguageServerContribution).to(YangLanguageServerContribution).inSingletonScope()
})