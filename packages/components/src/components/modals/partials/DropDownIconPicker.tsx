import React, { useState, useRef } from 'react'
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Modal,
  ScrollView,
} from 'react-native'
import { avatarSize, scaleFactor } from '../../../styles/variables'
import { ThemedIcon, ThemedIconProps } from '../../themed/ThemedIcon'
import { sharedStyles } from '../../../styles/shared'
import { getThemeColorOrItself } from '../../themed/helpers'
import { useTheme } from '../../context/ThemeContext'
import { useFormik } from 'formik'

// All possible icons that user can select as the column icon for uniqueness.
// We provide only limited set of icons so that user will not be overwhelmed
// with all possible choices.
// TODO(chenweilunster): Add more icons on user demand
const icons: PickerItem[] = [
  {
    icon: {
      family: 'material',
      name: 'rss-feed',
    },
  },
  {
    icon: {
      family: 'material',
      name: 'alarm',
    },
  },
  {
    icon: {
      family: 'material',
      name: 'account-box',
    },
  },
  {
    icon: {
      family: 'material',
      name: 'home',
    },
  },
  {
    icon: {
      family: 'material',
      name: 'book',
    },
  },
  {
    icon: {
      family: 'material',
      name: 'public',
    },
  },
]

// Denote a single picker item
export interface PickerItem {
  // If provided, show icon on the left of the text.
  icon: ThemedIconProps
}

export interface DropDownPickerProps {
  // An array of data to be rendered as the dropdown options.
  data: Array<PickerItem>

  // Default text shown to user if no data is selected.
  defaultButtonText?: string

  // default selected item index, if unset display defaultButtonText
  defaultIndex?: number

  // form to fill
  formikProps: ReturnType<typeof useFormik>
}

// base styl for the dropdown
const styles = StyleSheet.create({
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1 * scaleFactor,
    width: avatarSize * 2 * scaleFactor,
    height: avatarSize * scaleFactor,
    borderRadius: 10 * scaleFactor,
    paddingHorizontal: 8,
    overflow: 'hidden',
  },
  dropdownButtonOpen: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1 * scaleFactor,
    borderBottomWidth: 0,
    width: avatarSize * 2 * scaleFactor,
    height: avatarSize * scaleFactor,
    borderTopLeftRadius: 10 * scaleFactor,
    borderTopRightRadius: 10 * scaleFactor,
    paddingHorizontal: 8,
    overflow: 'hidden',
  },
  dropdownSelection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1 * scaleFactor,
    width: avatarSize * 2 * scaleFactor,
    height: avatarSize * scaleFactor,
    paddingHorizontal: 8,
    overflow: 'hidden',
  },
  dropdownIcon: {
    width: 15 * scaleFactor,
    fontSize: 15 * scaleFactor,
    textAlign: 'center',
  },
  selectedIcon: {
    width: 20 * scaleFactor,
    fontSize: 20 * scaleFactor,
  },
  dropdownCustomizedButtonParent: {
    flex: 1,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  dropdownMenu: {
    height: avatarSize * 3.5 * scaleFactor,
    width: avatarSize * 2 * scaleFactor,
    borderBottomLeftRadius: 10 * scaleFactor,
    borderBottomRightRadius: 10 * scaleFactor,
    opacity: 1,
  },
  borderWidth1: {
    borderWidth: 1 * scaleFactor,
  },
})

export const DropDownIconPicker = React.memo((props: DropDownPickerProps) => {
  const { data, defaultButtonText, defaultIndex, formikProps } = props

  const [openDropdown, setOpenDropdown] = useState<boolean>(false)
  const [selectedIndex, setSelectedIndex] = useState<number>(-1)

  // PY and PX determines the initial absolute position of the upper left point
  // for dropdown menu.
  const [PY, setPY] = useState<number>(0)
  const [PX, setPX] = useState<number>(0)

  if (defaultIndex) setSelectedIndex(defaultIndex)

  const DropdownButton = useRef<TouchableOpacity>(null)

  const theme = useTheme()
  const color = getThemeColorOrItself(theme, 'backgroundColor')
  const borderColor = getThemeColorOrItself(theme, 'foregroundColor')

  function renderDropdown() {
    return (
      <Modal animationType="none" transparent={true} visible={true}>
        <TouchableOpacity
          activeOpacity={1}
          style={[
            {
              width: '100%',
              height: '100%',
            },
          ]}
          onPress={() => setOpenDropdown(false)}
        >
          <View
            style={[
              styles.dropdownMenu,
              {
                top: PY,
                left: PX,
              },
            ]}
          >
            <ScrollView
              style={[
                styles.dropdownMenu,
                styles.borderWidth1,
                { borderColor: borderColor },
              ]}
            >
              {icons.map((pickerItem) => (
                <TouchableOpacity
                  key={`column-icon-key-${pickerItem.icon?.name}`}
                  activeOpacity={0.5}
                  style={[
                    styles.dropdownSelection,
                    {
                      backgroundColor: color,
                      borderColor: borderColor,
                    },
                  ]}
                  onPress={() => {
                    formikProps.values['icon'] = pickerItem.icon
                    setOpenDropdown(false)
                  }}
                >
                  <ThemedIcon
                    {...pickerItem.icon}
                    color="foregroundColor"
                    selectable={false}
                    style={[styles.selectedIcon]}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    )
  }

  function onDropdownOpen() {
    DropdownButton.current?.measure((fx, fy, w, h, px, py) => {
      setPY(py + h)
      setPX(px)
    })
    setOpenDropdown(!openDropdown)
  }

  return (
    <View style={[sharedStyles.paddingHorizontal]}>
      <TouchableOpacity
        ref={DropdownButton}
        activeOpacity={0.5}
        style={[
          openDropdown ? styles.dropdownButtonOpen : styles.dropdownButton,
          {
            backgroundColor: color,
            borderColor: borderColor,
          },
        ]}
        onPress={() => onDropdownOpen()}
      >
        <ThemedIcon
          color="foregroundColor"
          family={formikProps.values['icon'].family}
          name={formikProps.values['icon'].name}
          selectable={false}
          style={[styles.selectedIcon]}
        />
        <ThemedIcon
          color="foregroundColor"
          family="octicon"
          name={openDropdown ? 'chevron-up' : 'chevron-down'}
          selectable={false}
          style={[styles.dropdownIcon]}
        />
        {openDropdown && renderDropdown()}
      </TouchableOpacity>
    </View>
  )
})

DropDownIconPicker.displayName = 'DropDownPicker'
