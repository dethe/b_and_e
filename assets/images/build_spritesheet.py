from PIL import Image


def build_player_sheet():
    sheet = Image.new('RGBA', (1400, 140), 'rgba(0,0,0,0)')

    boots = [Image.open('boots/boots_{}_sm.png'.format(i+1)) for i in range(5)]
    dresses = [Image.open('dress/dress_{}_sm.png'.format(i+1)) for i in range(4)]
    heads = [Image.open('head/head_{}_sm.png'.format(i+1)) for i in range(4)]
    hats = [Image.open('hat/hat_{}_sm.png'.format(i+1)) for i in range(4)]

    x_offset = 0
    # height of parts is greater than height of whole, so adding "slop" to fix
    boots_y = 140 - 28
    dress_y = 140 - (28 + 51) + 10
    head_y = 140 - (28 + 51 + 40) + 19
    hat_y = 5

    for i in range(20):
        x_offset = 70 * i
        sheet.paste(boots[i%5], (x_offset, boots_y), boots[i%5])
        sheet.paste(dresses[i%4], (x_offset, dress_y), dresses[i%4])
        sheet.paste(heads[i%4], (x_offset, head_y), heads[i%4])
        sheet.paste(hats[i%4], (x_offset, hat_y), hats[i%4])

    sheet.save('character_sheet.png')

def build_map_sheet():
    white = Image.new('RGBA', (70,70), '#FFFFFF')
    white.save('walls/walls_10_sm.png')
    sheet = Image.new('RGBA', (350, 420), 'rgba(0,0,0,0)')
    wall = [Image.open('walls/walls_{:02}_sm.png'.format(i+1)) for i in range(10)]
    torch = [Image.open('torch/torch_{:02}_sm.png'.format(i+1)) for i in range(20)]
    block = wall + torch
    for y in range(6):
        for x in range(5):
            sheet.paste(block[x%5 + y*5], (x*70, y*70), block[x%5 + y*5])
    sheet.save('map_sheet.png')


if __name__ == '__main__':
    build_player_sheet()
    build_map_sheet()
